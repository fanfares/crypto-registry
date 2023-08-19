import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import {
  AmountSentBySender,
  CreateSubmissionDto,
  CustomerHoldingDto,
  Network,
  SubmissionDto,
  SubmissionRecord,
  SubmissionStatus
} from '@bcr/types';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { getHash, getNow, minimumBitcoinPaymentInSatoshi } from '../utils';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { getNetworkForZpub } from '../crypto/get-network-for-zpub';
import { SubmissionConfirmationMessage, SubmissionConfirmationStatus } from '../types/submission-confirmation.types';
import { Cron } from '@nestjs/schedule';
import { MessageSenderService } from '../network/message-sender.service';
import { EventGateway } from '../network/event.gateway';
import { NodeService } from '../node';
import { DbInsertOptions } from '../db';
import { getLatestSubmissionBlock } from './get-latest-submission-block';
import { getWinningPost } from "../node/get-winning-post";

@Injectable()
export class SubmissionService {

  constructor(
    private db: DbService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private apiConfigService: ApiConfigService,
    private walletService: WalletService,
    private logger: Logger,
    private messageSenderService: MessageSenderService,
    private eventGateway: EventGateway,
    private nodeService: NodeService
  ) {
  }

  private async updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus,
    confirmationDate?: Date
  ) {
    const modifier: any = {status};
    if (confirmationDate ) {
      modifier.confirmationDate = confirmationDate
    }
    await this.db.submissions.update(submissionId,modifier);
    await this.emitSubmission(submissionId);
  }

  private async emitSubmission(submissionId: string) {
    const submission = await this.db.submissions.get(submissionId);
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submission._id
    });
    const submissionDto = submissionStatusRecordToDto(submission, confirmations);
    this.eventGateway.emitSubmissionUpdates(submissionDto);
  }

  @Cron('5 * * * * *')
  async executionCycle() {
    this.logger.log('Submissions execution cycle');

    if (await this.nodeService.isThisNodeStarting()) {
      this.logger.log('Submission Payment Check waiting on Start-Up');
      return;
    }

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

    for (const nextSubmission of submissions) {
      try {

        let submission = nextSubmission;
        this.logger.debug('Execute submission:' + submission._id);
        if (submission.status === SubmissionStatus.RETRIEVING_WALLET_BALANCE) {
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

  private async waitForPayment(submission: SubmissionRecord) {
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    const result = await bitcoinService.getAmountSentBySender(submission.paymentAddress, submission.exchangeZpub);
    if (result.noTransactions) {
      this.logger.debug(`No transactions found for submission ${submission._id}`);
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
      status: SubmissionConfirmationStatus.MATCHED,
      submissionId: submission._id,
      nodeAddress: this.apiConfigService.nodeAddress,
      submissionHash: submission.hash
    });
    await this.updateSubmissionStatus(submission._id, SubmissionStatus.WAITING_FOR_CONFIRMATION);
    await this.waitForConfirmation(submission._id)

    await this.messageSenderService.broadcastSubmissionConfirmation({
      submissionId: submission._id,
      submissionHash: submission.hash,
      confirmed: true
    });
  }

  private async getConfirmationStatus(submissionId: string) {
    const confirmations = await this.db.submissionConfirmations.find({submissionId});
    const submission = await this.db.submissions.get(submissionId);

    let status: SubmissionStatus;
    const confirmedCount = confirmations.filter(c => c.status === SubmissionConfirmationStatus.MATCHED).length;
    const rejectedCount = confirmations.filter(c => c.status === SubmissionConfirmationStatus.RECEIVED_REJECTED || c.status === SubmissionConfirmationStatus.MATCH_FAILED).length;
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
    this.logger.log('create submission:' + createSubmissionDto._id, {
      createSubmissionDto
    })

    if (createSubmissionDto._id) {
      const submission = await this.db.submissions.get(createSubmissionDto._id);
      if (submission) {
        this.logger.log('Receiver received submission index from leader');
        if (!createSubmissionDto.index) {
          throw new Error('Follower expected submission index from leader');
        }
        if (!createSubmissionDto.paymentAddress) {
          throw new Error('Follower expected payment address from leader');
        }
        await this.assignLeaderDerivedData(submission._id, createSubmissionDto.index, createSubmissionDto.paymentAddress,
          createSubmissionDto.leaderAddress, createSubmissionDto.confirmationsRequired);
        await this.emitSubmission(submission._id)
        return;
      }
    }

    const network = getNetworkForZpub(createSubmissionDto.exchangeZpub);
    const bitcoinService = this.bitcoinServiceFactory.getService(network);
    bitcoinService.validateZPub(createSubmissionDto.exchangeZpub);
    const totalCustomerFunds = createSubmissionDto.customerHoldings.reduce((amount, holding) => amount + holding.amount, 0);
    const paymentAmount = Math.max(totalCustomerFunds * this.apiConfigService.paymentPercentage, minimumBitcoinPaymentInSatoshi);

    if (createSubmissionDto.paymentAddress) {
      await this.walletService.storeReceivingAddress(this.apiConfigService.getRegistryZpub(network), 'Registry', createSubmissionDto.paymentAddress);
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
      index: createSubmissionDto.index,
      balanceRetrievalAttempts: 0,
      network: network,
      precedingHash: null,
      hash: null,
      paymentAddress: createSubmissionDto.paymentAddress,
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
      paymentAddress: createSubmissionDto.paymentAddress,
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

  private async retrieveWalletBalance(
    submissionId: string,
  ) {
    this.logger.log('Retrieve wallet balance, submission: ' + submissionId)
    const submission = await this.db.submissions.get(submissionId);

    // Check the Exchange Wallet Balance
    const walletBalanceCheckFailed = await this.doWalletBalanceCheck(submission);
    if (walletBalanceCheckFailed) {
      this.logger.log('Wallet balance check failed, submission: ' + submissionId)
      return;
    }

    const leaderAddress = await this.nodeService.getLeaderAddress();
    if (!submission.index) {
      const customerHoldingsDto: CustomerHoldingDto[] = (await this.db.customerHoldings
        .find({submissionId}))
        .map(holding => ({
          hashedEmail: holding.hashedEmail,
          amount: holding.amount
        }));

      const createSubmissionDto: CreateSubmissionDto = {
        customerHoldings: customerHoldingsDto,
        receiverAddress: submission.receiverAddress,
        leaderAddress: leaderAddress,
        exchangeZpub: submission.exchangeZpub,
        exchangeName: submission.exchangeName,
        _id: submissionId
      };

      const isLeader = await this.nodeService.isThisNodeLeader();
      if (isLeader) {
        this.logger.log('Leader received new submission:' + submissionId);
        const paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.getRegistryZpub(submission.network), 'Registry');
        const latestSubmissionBlock = await getLatestSubmissionBlock(this.db);
        const newSubmissionIndex = (latestSubmissionBlock?.index ?? 0) + 1;
        const nodeCount = await this.nodeService.getCurrentNodeCount();
        const confirmationsRequired = getWinningPost(nodeCount);
        await this.assignLeaderDerivedData(submissionId, newSubmissionIndex, paymentAddress, leaderAddress, confirmationsRequired);
        await this.messageSenderService.broadcastCreateSubmission({
          ...createSubmissionDto,
          index: newSubmissionIndex,
          paymentAddress: paymentAddress,
          confirmationsRequired: confirmationsRequired
        });
      } else {
        this.logger.log('Follower received new submission');
        const leaderAddress = await this.nodeService.getLeaderAddress();
        if (!leaderAddress) {
          throw new BadRequestException('Cannot process request when leader is not elected')
        }
        await this.messageSenderService.sendCreateSubmission(leaderAddress, createSubmissionDto);
      }
    } else {
      this.logger.log('Follower received submission from leader');
      await this.assignLeaderDerivedData(submissionId, submission.index, submission.paymentAddress, leaderAddress, submission.confirmationsRequired);
    }

    // Move to next step
    await this.db.submissions.update(submission._id, {
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
    });

    await this.emitSubmission(submissionId);
  }

  private async doWalletBalanceCheck(
    submission: SubmissionRecord,
  ) {
    let walletBalanceCheckFailed = false;
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
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
    this.logger.log('Wallet Balance ' + submission.exchangeZpub + '=' + totalExchangeFunds )
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
    return walletBalanceCheckFailed;
  }

  private async assignLeaderDerivedData(
    submissionId: string,
    index: number,
    paymentAddress: string,
    leaderAddress: string,
    confirmationsRequired: number
  ) {
    const submission = await this.db.submissions.get(submissionId);

    if (!submission) {
      this.logger.log('Cannot find submission ', {submissionId});
      return;
    }

    // todo - why not just index === 1 precedingHash = 'genesis'

    const previousSubmission = await this.db.submissions.findOne({
      precedingHash: {$ne: null},
      index: index - 1,
    });

    let precedingHash: string;
    if (previousSubmission) {
      precedingHash = previousSubmission.hash;
    } else {
      // Can be either unprocessed submission with index-1, or genesis event
      const submissionCount = await this.db.submissions.count({
        hash: {$ne: null},
      });

      if (submissionCount === 0) {
        precedingHash = 'genesis'
      }
    }

    if (!precedingHash) {
      this.logger.log('Wait for preceding submission to complete', {submissionId})
      return
    }

    const customerHoldings = await this.db.customerHoldings.find({submissionId}, {
      projection: {
        hashedEmail: 1,
        amount: 1
      }
    });

    const hash = getHash(JSON.stringify({
      receiverAddress: submission.receiverAddress,
      index: index,
      paymentAddress: paymentAddress,
      network: submission.network,
      paymentAmount: submission.paymentAmount,
      totalCustomerFunds: submission.totalCustomerFunds,
      exchangeName: submission.exchangeName,
      exchangeZpub: submission.exchangeZpub,
      holdings: customerHoldings.map(h => ({
        hashedEmail: h.hashedEmail.toLowerCase(),
        amount: h.amount
      }))
    }) + precedingHash, 'sha256');

    // todo - only hash and preceding hash should be required here.
    await this.db.submissions.update(submissionId, {
      hash, index, precedingHash, paymentAddress, leaderAddress, confirmationsRequired
    });

    await this.walletService.storeReceivingAddress(this.apiConfigService.getRegistryZpub(submission.network), 'Registry', paymentAddress);
    await this.nodeService.updateStatus(false, this.apiConfigService.nodeAddress, await this.nodeService.getSyncRequest());
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
        status: confirmation.confirmed ? SubmissionConfirmationStatus.RECEIVED_CONFIRMED : SubmissionConfirmationStatus.RECEIVED_REJECTED,
        submissionId: submission._id,
        nodeAddress: confirmingNodeAddress,
        submissionHash: confirmation.submissionHash
      });

      await this.waitForConfirmation(confirmation.submissionId)

    } catch (err) {
      this.logger.error('Failed to process submission confirmation', confirmation);
    }
  }

  private async waitForConfirmation(submissionId: string) {
    this.logger.log(`Update submission confirmation status ${submissionId}`)

    const submission = await this.db.submissions.get(submissionId);

    if (submission.status !== SubmissionStatus.WAITING_FOR_CONFIRMATION && submission.status !== SubmissionStatus.CONFIRMED) {
      this.logger.log('Cannot process submission confirmation at this time')
      return;
    }

    // Match Received Confirmations
    const confirmations = await this.db.submissionConfirmations.find({submissionId})
    for (const confirmation of confirmations) {
      if (confirmation.status === SubmissionConfirmationStatus.RECEIVED_CONFIRMED) {
        const newStatus = confirmation.submissionHash === submission.hash ? SubmissionConfirmationStatus.MATCHED : SubmissionConfirmationStatus.MATCH_FAILED;
        await this.db.submissionConfirmations.update(confirmation._id, {
          status: newStatus
        })
        if (newStatus === SubmissionConfirmationStatus.MATCH_FAILED) {
          await this.nodeService.setNodeBlackBall(confirmation.nodeAddress);
        }
      }
    }

    // Finally calculate and update submission status
    const confirmationStatus = await this.getConfirmationStatus(submission._id);

    let confirmationDate: Date = null;
    if ( confirmationStatus === SubmissionStatus.CONFIRMED && submission.status !== SubmissionStatus.CONFIRMED ) {
      confirmationDate = getNow();
    }

    await this.updateSubmissionStatus(submission._id, confirmationStatus, confirmationDate);

  }

}
