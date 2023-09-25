import { BadRequestException, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import {
  AmountSentBySender,
  CreateSubmissionDto,
  Network,
  SubmissionDto,
  SubmissionRecord,
  SubmissionStatus
} from '@bcr/types';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { getNow, minimumBitcoinPaymentInSatoshi } from '../utils';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { getNetworkForZpub } from '../crypto/get-network-for-zpub';
import { SubmissionConfirmationMessage, SubmissionConfirmationStatus } from '../types/submission-confirmation.types';
import { EventGateway } from '../event-gateway';
import { NodeService } from '../node';
import { DbInsertOptions } from '../db';

export abstract class AbstractSubmissionService {

  protected constructor(
    protected db: DbService,
    protected bitcoinServiceFactory: BitcoinServiceFactory,
    protected apiConfigService: ApiConfigService,
    protected walletService: WalletService,
    protected logger: Logger,
    protected eventGateway: EventGateway,
    protected nodeService: NodeService
  ) {
  }

  private async updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus,
    confirmationDate?: Date
  ) {
    const modifier: any = {status};
    if (confirmationDate) {
      modifier.confirmationDate = confirmationDate
    }
    await this.db.submissions.update(submissionId, modifier);
    await this.emitSubmission(submissionId);
  }

  protected async emitSubmission(submissionId: string) {
    const submission = await this.db.submissions.get(submissionId);
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submission._id
    });
    const submissionDto = submissionStatusRecordToDto(submission, confirmations);
    this.eventGateway.emitSubmissionUpdates(submissionDto);
  }

  async executionCycle() {
    this.logger.log('Submissions execution cycle');

    const submissions = await this.db.submissions.find({
      status: {
        $in: [
          SubmissionStatus.WAITING_FOR_PAYMENT,
          SubmissionStatus.WAITING_FOR_CONFIRMATION,
          SubmissionStatus.RETRIEVING_WALLET_BALANCE,
          SubmissionStatus.SENDER_MISMATCH
        ]
      },
      isCurrent: true
    }, {
      sort: {
        index: 1
      }
    });

    this.logger.log('Found ' + submissions.length + ' submissions to process', {
      submissions: submissions
    });

    for (const nextSubmission of submissions) {
      try {

        let submission = nextSubmission;
        const currentLeaderAddress = await this.nodeService.getLeaderAddress()
        this.logger.log('Execute submission:' + submission._id + ', leader is ' + currentLeaderAddress);

        // Leader must be assigned to retrieve wallet balance
        if (submission.status === SubmissionStatus.RETRIEVING_WALLET_BALANCE && currentLeaderAddress) {
          await this.retrieveWalletBalance(nextSubmission._id);
        }

        submission = await this.db.submissions.get(submission._id)
        if (submission.paymentAddress && (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT || submission.status === SubmissionStatus.SENDER_MISMATCH)) {
          await this.waitForPayment(submission);
        }

        submission = await this.db.submissions.get(submission._id)
        if (submission.status === SubmissionStatus.WAITING_FOR_CONFIRMATION) {
          await this.waitForConfirmation(submission._id)
        }

      } catch (err) {
        this.logger.error('Failed to get submission status:' + err.message, {err})
      }
    }
  }

  async getPaymentStatus(submissionId: string): Promise<AmountSentBySender> {
    const submission = await this.db.submissions.get(submissionId)
    const bitcoinService = this.bitcoinServiceFactory.getService(Network.testnet);
    return await bitcoinService.getAmountSentBySender(submission.paymentAddress, submission.exchangeZpub);
  }

  protected async waitForPayment(submission: SubmissionRecord) {
    this.logger.log('Wait for payment:' + submission._id);
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    const result = await bitcoinService.getAmountSentBySender(submission.paymentAddress, submission.exchangeZpub);
    if (result.noTransactions) {
      this.logger.log(`No transactions found yet, for submission ${submission._id}`);
      return;
    }

    if (result.senderMismatch) {
      await this.updateSubmissionStatus(submission._id, SubmissionStatus.SENDER_MISMATCH);
      return;
    }

    if (result.valueOfOutputFromSender < submission.paymentAmount) {
      this.logger.debug(`Insufficient payment: ${submission._id}`, {
        senderBalance: result.valueOfOutputFromSender, expectedAmount: submission.paymentAmount
      })
      return;
    }

    this.logger.debug(`Confirm Submission ${submission._id}`)
    await this.db.submissionConfirmations.insert({
      status: SubmissionConfirmationStatus.CONFIRMED,
      submissionId: submission._id,
      nodeAddress: this.apiConfigService.nodeAddress,
    });
    await this.updateSubmissionStatus(submission._id, SubmissionStatus.WAITING_FOR_CONFIRMATION);
    await this.waitForConfirmation(submission._id)
  }

  private async getConfirmationStatus(submissionId: string) {
    const confirmations = await this.db.submissionConfirmations.find({submissionId});
    const submission = await this.db.submissions.get(submissionId);

    let status: SubmissionStatus;
    const confirmedCount = confirmations.filter(c => c.status === SubmissionConfirmationStatus.CONFIRMED).length;
    const rejectedCount = confirmations.filter(c => c.status === SubmissionConfirmationStatus.REJECTED ).length;
    if (rejectedCount > 0) {
      status = SubmissionStatus.REJECTED;
    } else if (confirmedCount >= submission.confirmationsRequired) {
      status = SubmissionStatus.CONFIRMED;
    } else {
      const submission = await this.db.submissions.get(submissionId);
      status = submission.status
    }
    return status;
  }

  async getSubmissionDto(
    submissionId: string
  ): Promise<SubmissionDto> {
    const submission = await this.db.submissions.get(submissionId);
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submission._id
    });
    return submissionStatusRecordToDto(submission, confirmations);
  }

  async cancel(submissionId: string) {
    await this.updateSubmissionStatus(submissionId, SubmissionStatus.CANCELLED)
  }

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto
  ): Promise<string> {
    this.logger.log('create submission:' + createSubmissionDto._id);

    const network = getNetworkForZpub(createSubmissionDto.exchangeZpub);
    const bitcoinService = this.bitcoinServiceFactory.getService(network);

    if (!bitcoinService) {
      throw new BadRequestException('Node is not configured for network ' + network);
    }

    bitcoinService.validateZPub(createSubmissionDto.exchangeZpub);
    const totalCustomerFunds = createSubmissionDto.customerHoldings.reduce((amount, holding) => amount + holding.amount, 0);
    const paymentAmount = Math.max(totalCustomerFunds * this.apiConfigService.paymentPercentage, minimumBitcoinPaymentInSatoshi);

    if (createSubmissionDto.paymentAddress) {
      await this.walletService.storeReceivingAddress( {
        network,
        zpub: this.apiConfigService.getRegistryZpub(network),
        address: createSubmissionDto.paymentAddress,
        index: createSubmissionDto.paymentAddressIndex,
      });
    }

    const currentSubmission = await this.db.submissions.findOne({
      exchangeZpub: createSubmissionDto.exchangeZpub,
      network: network,
      isCurrent: true
    });

    if (currentSubmission && currentSubmission._id !== createSubmissionDto._id) {
      await this.db.submissions.updateMany({
        _id: currentSubmission._id
      }, {
        isCurrent: false
      });

      await this.db.customerHoldings.updateMany({
        submissionId: currentSubmission._id
      }, {
        isCurrent: false
      });
    }

    let options: DbInsertOptions = null;

    if (createSubmissionDto._id) {
      options = {_id: createSubmissionDto._id};
    }

    const submissionId = await this.db.submissions.insert({
      receiverAddress: createSubmissionDto.receiverAddress,
      leaderAddress: createSubmissionDto.leaderAddress,
      balanceRetrievalAttempts: 0,
      network: network,
      paymentAddress: createSubmissionDto.paymentAddress,
      paymentAddressIndex: createSubmissionDto.paymentAddressIndex,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      status: SubmissionStatus.NEW,
      exchangeName: createSubmissionDto.exchangeName,
      exchangeZpub: createSubmissionDto.exchangeZpub,
      isCurrent: true,
      confirmationsRequired: createSubmissionDto.confirmationsRequired,
      confirmationDate: null
    }, options);

    await this.db.customerHoldings.insertMany(createSubmissionDto.customerHoldings.map((holding) => ({
      hashedEmail: holding.hashedEmail.toLowerCase(),
      amount: holding.amount,
      network: network,
      isCurrent: true,
      submissionId: submissionId
    })));

    await this.db.submissions.update(submissionId, {
      status: SubmissionStatus.RETRIEVING_WALLET_BALANCE
    })
    await this.emitSubmission(submissionId)
    return submissionId;
  }

  protected async retrieveWalletBalance(
    submissionId: string,
  ) {
    this.logger.log('Retrieve wallet balance, submission: ' + submissionId)
    const submission = await this.db.submissions.get(submissionId);

    // Check the Exchange Wallet Balance
    const walletBalanceCheckFailed = await this.doWalletBalanceCheck(submission);

    if (walletBalanceCheckFailed) {
      this.logger.error('Wallet balance check failed', {submissionId});
    }

    return walletBalanceCheckFailed
  }

  private async doWalletBalanceCheck(
    submission: SubmissionRecord,
  ) {
    let walletBalanceCheckFailed = false;
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    await bitcoinService.testService();
    let totalExchangeFunds: number;
    try {
      totalExchangeFunds = await bitcoinService.getWalletBalance(submission.exchangeZpub);
    } catch (err) {
      this.logger.error('Wallet balance check failed', {err});
      await this.db.submissions.update(submission._id, {
        balanceRetrievalAttempts: submission.balanceRetrievalAttempts + 1
      });
      return true;
    }
    this.logger.log('Wallet Balance ' + submission.exchangeZpub + '=' + totalExchangeFunds)
    if (totalExchangeFunds < (submission.totalCustomerFunds * this.apiConfigService.reserveLimit)) {
      const reserveLimit = Math.round(this.apiConfigService.reserveLimit * 100);
      this.logger.warn(`Submission ${submission._id} has insufficient funds ${totalExchangeFunds} vs ${reserveLimit}`);
      await this.db.submissions.update(submission._id, {
        status: SubmissionStatus.INSUFFICIENT_FUNDS,
        totalExchangeFunds: totalExchangeFunds
      });
      await this.emitSubmission(submission._id);
      walletBalanceCheckFailed = true;
    } else {
      await this.db.submissions.update(submission._id, {
        totalExchangeFunds: totalExchangeFunds
      });
    }
    await this.emitSubmission(submission._id);
    return walletBalanceCheckFailed;
  }

  async confirmSubmission(confirmingNodeAddress: string, confirmation: SubmissionConfirmationMessage) {
    this.logger.log('Confirm Submission', {confirmation, confirmingNodeAddress})
    try {

      const submissionConfirmation = await this.db.submissionConfirmations.findOne({
        submissionId: confirmation.submissionId,
        nodeAddress: confirmingNodeAddress
      })

      if (submissionConfirmation) {
        this.logger.log('Submission Confirmation already received');
        return;
      }

      const submission = await this.db.submissions.get(confirmation.submissionId);

      if (!submission) {
        this.logger.error('No submission for confirmation', confirmation);
        return;
      }

      await this.db.submissionConfirmations.insert({
        status: confirmation.confirmed ? SubmissionConfirmationStatus.CONFIRMED : SubmissionConfirmationStatus.REJECTED,
        submissionId: submission._id,
        nodeAddress: confirmingNodeAddress,
      });

      await this.waitForConfirmation(confirmation.submissionId)

    } catch (err) {
      this.logger.error('Failed to process submission confirmation', confirmation);
    }
  }

  private async waitForConfirmation(submissionId: string) {
    this.logger.log(`Wait for confirmation ${submissionId}`)

    const submission = await this.db.submissions.get(submissionId);

    if (submission.status !== SubmissionStatus.WAITING_FOR_CONFIRMATION && submission.status !== SubmissionStatus.CONFIRMED) {
      this.logger.log('Cannot process submission confirmation at this time')
      return;
    }

    // Finally calculate and update submission status
    const confirmationStatus = await this.getConfirmationStatus(submission._id);

    let confirmationDate: Date = null;
    if (confirmationStatus === SubmissionStatus.CONFIRMED && submission.status !== SubmissionStatus.CONFIRMED) {
      confirmationDate = getNow();
    }

    await this.updateSubmissionStatus(submission._id, confirmationStatus, confirmationDate);

  }

}
