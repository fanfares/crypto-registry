import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto, CustomerHoldingDto, SubmissionDto, SubmissionRecord, SubmissionStatus } from '@bcr/types';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { getHash, minimumBitcoinPaymentInSatoshi } from '../utils';
import { WalletService } from '../crypto/wallet.service';
import { isTxsSendersFromWallet } from '../crypto/is-tx-sender-from-wallet';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { getNetworkForZpub } from '../crypto/get-network-for-zpub';
import { SubmissionConfirmationMessage } from '../types/submission-confirmation.types';
import { Cron } from '@nestjs/schedule';
import { MessageSenderService } from '../network/message-sender.service';
import { EventGateway } from '../network/event.gateway';
import { NodeService } from '../node';
import { DbInsertOptions } from '../db';
import { getLatestSubmissionBlock } from './get-latest-submission-block';

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

  private async updateSubmissionStatus(submissionId: string, status: SubmissionStatus) {
    await this.db.submissions.update(submissionId, {status});
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
  async waitForSubmissionsForPayment() {
    if (await this.nodeService.isThisNodeStarting()) {
      this.logger.log('Submission Payment Check waiting on Start-Up');
      return;
    }

    this.logger.log('Submissions payment check');
    const submissions = await this.db.submissions.find({
      status: {$in: [SubmissionStatus.WAITING_FOR_PAYMENT, SubmissionStatus.WAITING_FOR_CONFIRMATION]},
      isCurrent: true
    });
    this.logger.log('Submissions payment checking:' + submissions.map(s => s._id));
    for (const submission of submissions) {
      try {
        this.logger.debug('Polling for submission payment:' + submission._id);
        // if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
        const txs = await bitcoinService.getTransactionsForAddress(submission.paymentAddress);
        if (txs.length === 0) {
          this.logger.debug(`No transactions found for submission ${submission._id}`)
        } else if (!isTxsSendersFromWallet(txs, submission.exchangeZpub)) {
          await this.updateSubmissionStatus(submission._id, SubmissionStatus.SENDER_MISMATCH);
        } else {
          const addressBalance = await bitcoinService.getAddressBalance(submission.paymentAddress);
          if (addressBalance < submission.paymentAmount) {
            this.logger.debug(`Insufficient payment: ${submission._id}`, {
              addressBalance, expectedAmount: submission.paymentAmount
            })
          } else {
            this.logger.debug(`Transactions found for submission ${submission._id}. Confirming submission`)
            await this.db.submissionConfirmations.insert({
              confirmed: true,
              submissionId: submission._id,
              nodeAddress: this.apiConfigService.nodeAddress
            });
            await this.updateSubmissionStatus(submission._id, SubmissionStatus.WAITING_FOR_CONFIRMATION);
            const confirmationStatus = await this.getConfirmationStatus(submission._id);
            if (confirmationStatus === SubmissionStatus.CONFIRMED) {
              await this.updateSubmissionStatus(submission._id, confirmationStatus);
            }
            await this.messageSenderService.broadcastSubmissionConfirmation({
              submissionId: submission._id,
              submissionHash: submission.hash,
              confirmed: true
            });
          }
        }
        if (submission.status === SubmissionStatus.WAITING_FOR_CONFIRMATION) {
          const confirmationStatus = await this.getConfirmationStatus(submission._id);
          await this.updateSubmissionStatus(submission._id, confirmationStatus);
        }
      } catch (err) {
        this.logger.error('Failed to get submission status:' + err.message, {err})
      }
    }
  }

  private async getConfirmationStatus(submissionId: string) {
    const confirmations = await this.db.submissionConfirmations.find({submissionId});

    // todo - node count can vary
    const nodeCount = await this.db.nodes.count({});
    let status: SubmissionStatus;
    const confirmedCount = confirmations.filter(c => c.confirmed).length;
    const rejectedCount = confirmations.filter(c => !c.confirmed).length;
    if (rejectedCount > 0) {
      status = SubmissionStatus.REJECTED;
    } else if (confirmedCount === nodeCount) {
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
        await this.assignLeaderDerivedData(submission._id, createSubmissionDto.index, createSubmissionDto.paymentAddress, createSubmissionDto.leaderAddress);
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
      index: null,
      network: network,
      precedingHash: null,
      hash: null,
      paymentAddress: createSubmissionDto.paymentAddress,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      status: SubmissionStatus.RETRIEVING_WALLET_BALANCE,
      exchangeName: createSubmissionDto.exchangeName,
      exchangeZpub: createSubmissionDto.exchangeZpub,
      isCurrent: true
    }, options);

    await this.db.customerHoldings.insertMany(createSubmissionDto.customerHoldings.map((holding) => ({
      hashedEmail: holding.hashedEmail.toLowerCase(),
      amount: holding.amount,
      paymentAddress: createSubmissionDto.paymentAddress,
      network: network,
      isCurrent: true,
      submissionId: submissionId
    })));

    await this.emitSubmission(submissionId)

    if (this.apiConfigService.syncMessageSending) {
      await this.processSubmission(submissionId, createSubmissionDto.index, createSubmissionDto.paymentAddress);
    } else {
      this.processSubmission(submissionId, createSubmissionDto.index, createSubmissionDto.paymentAddress)
        .then(() => this.logger.log('Process submission complete'))
        .catch(err => this.logger.error(err.message, err));
    }

    return submissionId;
  }

  private async processSubmission(
    submissionId: string,
    index: number | null,
    paymentAddress: string | null
  ) {
    const submission = await this.db.submissions.get(submissionId);

    // Check the Exchange Wallet Balance
    const walletBalanceCheckFailed = await this.doWalletBalanceCheck(submission);
    if ( walletBalanceCheckFailed ) {
      return;
    }

    const leaderAddress = await this.nodeService.getLeaderAddress();
    if (!index) {
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
        this.logger.log('Leader received new submission');
        const paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.getRegistryZpub(submission.network), 'Registry');
        const latestSubmissionBlock = await getLatestSubmissionBlock(this.db);
        const newSubmissionIndex = (latestSubmissionBlock?.index ?? 0) + 1;
        await this.assignLeaderDerivedData(submissionId, newSubmissionIndex, paymentAddress, leaderAddress);
        await this.messageSenderService.broadcastCreateSubmission({
          ...createSubmissionDto,
          index: newSubmissionIndex,
          paymentAddress: paymentAddress
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
      await this.assignLeaderDerivedData(submissionId, index, paymentAddress, leaderAddress);
    }
    await this.emitSubmission(submissionId);
  }

  private async doWalletBalanceCheck(
    submission: SubmissionRecord,
  ) {
    let walletBalanceCheckFailed = false;
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    const totalExchangeFunds = await bitcoinService.getWalletBalance(submission.exchangeZpub);
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
        status: SubmissionStatus.WAITING_FOR_PAYMENT,
        totalExchangeFunds: totalExchangeFunds
      });
    }
    return walletBalanceCheckFailed;
  }

  private async assignLeaderDerivedData(
    submissionId: string,
    index: number,
    paymentAddress: string,
    leaderAddress: string
  ) {
    const submission = await this.db.submissions.get(submissionId);

    if (!submission) {
      this.logger.log('Cannot find submission ', {submissionId});
      return;
    }

    if (submission.index) {
      this.logger.error('Submission already on chain', {submissionId});
      return;
    }

    const previousSubmission = await this.db.submissions.findOne({
      index: index - 1
    });

    const precedingHash = previousSubmission?.hash ?? 'genesis';

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
    }) + previousSubmission?.hash ?? 'genesis', 'sha256');

    await this.db.submissions.update(submissionId, {
      hash, index, precedingHash, paymentAddress, leaderAddress
    });

    await this.walletService.storeReceivingAddress(this.apiConfigService.getRegistryZpub(submission.network), 'Registry', paymentAddress);
    await this.nodeService.updateStatus(false, this.apiConfigService.nodeAddress, await this.nodeService.getSyncRequest());
  }

  async confirmSubmission(confirmingNodeAddress: string, confirmation: SubmissionConfirmationMessage) {
    this.logger.log('Confirm Submission', {confirmation, confirmingNodeAddress})
    try {
      const submission = await this.db.submissions.get(confirmation.submissionId);

      const submissionConfirmation = await this.db.submissionConfirmations.findOne({
        submissionId: submission._id,
        nodeAddress: confirmingNodeAddress
      })

      if (submissionConfirmation ) {
        this.logger.log('Submission Confirmation already received');
        return;
      }

      this.logger.debug('Found submission', {submission})

      if (confirmation.submissionHash !== submission.hash) {
        // blackballed
        await this.nodeService.setNodeBlackBall(confirmingNodeAddress);
        return;
      }

      await this.db.submissionConfirmations.insert({
        confirmed: confirmation.confirmed,
        submissionId: submission._id,
        nodeAddress: confirmingNodeAddress
      });
      this.logger.debug('Inserted Submission Confirmation')

      const confirmationStatus = await this.getConfirmationStatus(submission._id);
      this.logger.debug(`Confirmation Status ${confirmationStatus}`)
      await this.updateSubmissionStatus(submission._id, confirmationStatus);

    } catch (err) {
      this.logger.error('Failed to process Submission confirmation', confirmation);
    }

  }

}
