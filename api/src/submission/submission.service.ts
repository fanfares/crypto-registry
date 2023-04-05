import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import {
  CreateSubmissionDto,
  CustomerHolding,
  SubmissionDto,
  SubmissionStatus,
  AssignSubmissionIndexDto
} from '@bcr/types';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { minimumBitcoinPaymentInSatoshi, getHash } from '../utils';
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
import { SynchronisationService } from '../syncronisation/synchronisation.service';
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
    private nodeService: NodeService,
    private syncService: SynchronisationService
  ) {
  }

  private async updateSubmissionStatus(submissionId: string, status: SubmissionStatus) {
    await this.db.submissions.update(submissionId, { status });
    const submission = await this.db.submissions.get(submissionId);
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submission._id
    });
    const submissionDto = submissionStatusRecordToDto(submission, confirmations);
    this.eventGateway.emitSubmissionUpdates(submissionDto);
  }

  @Cron('5 * * * * *')
  async waitForSubmissionsForPayment() {
    const submissions = await this.db.submissions.find({
      status: { $in: [SubmissionStatus.WAITING_FOR_PAYMENT, SubmissionStatus.WAITING_FOR_CONFIRMATION] },
      isCurrent: true
    });
    for (const submission of submissions) {
      this.logger.debug('polling for submission payment', { submission });
      if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
        const txs = await bitcoinService.getTransactionsForAddress(submission.paymentAddress);
        if (txs.length === 0) {
          break;
        } else if (!isTxsSendersFromWallet(txs, submission.exchangeZpub)) {
          await this.updateSubmissionStatus(submission._id, SubmissionStatus.SENDER_MISMATCH);
          break;
        } else {
          const addressBalance = await bitcoinService.getAddressBalance(submission.paymentAddress);
          if (addressBalance < submission.paymentAmount) {
            break;
          } else {
            await this.db.submissionConfirmations.insert({
              confirmed: true,
              submissionId: submission._id,
              nodeAddress: this.apiConfigService.nodeAddress
            });
            const confirmationStatus = await this.getConfirmationStatus(submission._id);
            await this.updateSubmissionStatus(submission._id, confirmationStatus);
            await this.messageSenderService.broadcastSubmissionConfirmation({
              submissionHash: submission.hash,
              confirmed: true
            });
          }
        }
      } else if (submission.status === SubmissionStatus.WAITING_FOR_CONFIRMATION) {
        const confirmationStatus = await this.getConfirmationStatus(submission._id);
        await this.updateSubmissionStatus(submission._id, confirmationStatus);
      }
    }
  }

  private async getConfirmationStatus(submissionId: string) {
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submissionId
    });
    const nodeCount = await this.db.nodes.count({});
    let status: SubmissionStatus;
    const confirmedCount = confirmations.filter(c => c.confirmed).length;
    const rejectedCount = confirmations.filter(c => !c.confirmed).length;
    if (rejectedCount > 0) {
      status = SubmissionStatus.REJECTED;
    } else if (confirmedCount === nodeCount) {
      status = SubmissionStatus.CONFIRMED;
    } else {
      status = SubmissionStatus.WAITING_FOR_CONFIRMATION;
    }
    return status;
  }

  async getSubmissionStatus(
    paymentAddress: string
  ): Promise<SubmissionDto> {
    const submission = await this.db.submissions.findOne({
      paymentAddress
    });
    if (!submission) {
      throw new BadRequestException('Invalid Address');
    }
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submission._id
    });
    return submissionStatusRecordToDto(submission, confirmations);
  }

  async cancel(paymentAddress: string) {
    await this.db.submissions.findOneAndUpdate({
      paymentAddress: paymentAddress
    }, {
      status: SubmissionStatus.CANCELLED
    });
  }

  async createSubmission(
    createSubmissionDto: CreateSubmissionDto
  ): Promise<SubmissionDto> {
    const network = getNetworkForZpub(createSubmissionDto.exchangeZpub);
    const bitcoinService = this.bitcoinServiceFactory.getService(network);
    bitcoinService.validateZPub(createSubmissionDto.exchangeZpub);

    const totalExchangeFunds = await bitcoinService.getWalletBalance(createSubmissionDto.exchangeZpub);
    if (totalExchangeFunds === 0) {
      throw new BadRequestException('Exchange Wallet Balance is zero');
    }

    const totalCustomerFunds = createSubmissionDto.customerHoldings.reduce((amount, holding) => amount + holding.amount, 0);
    if (totalExchangeFunds < (totalCustomerFunds * this.apiConfigService.reserveLimit)) {
      const reserveLimit = Math.round(this.apiConfigService.reserveLimit * 100);
      throw new BadRequestException(`Exchange funds are below reserve limit (${reserveLimit}% of customer funds)`);
    }

    const paymentAmount = Math.max(totalCustomerFunds * this.apiConfigService.paymentPercentage, minimumBitcoinPaymentInSatoshi);

    // todo - leader should be responsible for assigning payment address.
    let paymentAddress: string = createSubmissionDto.paymentAddress;
    if (!createSubmissionDto.paymentAddress) {
      paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.getRegistryZpub(network), 'Registry', network);
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
        paymentAddress: currentSubmission.paymentAddress,
        network: network
      }, {
        isCurrent: false
      });
    }

    let options: DbInsertOptions = null;

    if (createSubmissionDto._id) {
      options = { _id: createSubmissionDto._id };
    }

    const submissionId = await this.db.submissions.insert({
      initialNodeAddress: createSubmissionDto.initialNodeAddress,
      paymentAddress: paymentAddress,
      network: network,
      index: null,
      precedingHash: null,
      hash: null,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      totalExchangeFunds: totalExchangeFunds,
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
      exchangeName: createSubmissionDto.exchangeName,
      exchangeZpub: createSubmissionDto.exchangeZpub,
      isCurrent: true
    }, options);

    const inserts: CustomerHolding[] =
      createSubmissionDto.customerHoldings.map((holding) => ({
        hashedEmail: holding.hashedEmail.toLowerCase(),
        amount: holding.amount,
        paymentAddress: paymentAddress,
        network: network,
        isCurrent: true,
        submissionId: submissionId
      }));

    await this.db.customerHoldings.insertMany(inserts);

    const isLeader = await this.nodeService.isThisNodeLeader();

    if (!createSubmissionDto.index) {
      if (isLeader) {
        const latestSubmissionBlock = await getLatestSubmissionBlock(this.db);
        const newSubmissionIndex = latestSubmissionBlock.index + 1;
        await this.assignSubmissionIndex({ submissionId, index: newSubmissionIndex });
        await this.messageSenderService.broadcastCreateSubmission({
          ...createSubmissionDto,
          index: newSubmissionIndex
        });
      } else {
        this.logger.error('Only the leader should expect a submission with no index')
        return;
      }
    } else {
      // We are followers
      await this.assignSubmissionIndex({ submissionId, index: createSubmissionDto.index });
    }

    return {
      _id: submissionId,
      initialNodeAddress: createSubmissionDto.initialNodeAddress,
      paymentAddress: paymentAddress,
      exchangeZpub: createSubmissionDto.exchangeZpub,
      network: network,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      totalExchangeFunds: totalExchangeFunds,
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
      exchangeName: createSubmissionDto.exchangeName,
      isCurrent: true,
      confirmations: []
    };
  }

  async assignSubmissionIndex({
                                submissionId, index
                              }: AssignSubmissionIndexDto
  ) {
    const submission = await this.db.submissions.get(submissionId);

    if (!submission) {
      this.logger.log('Cannot find submission ', { submissionId });
      return;
    }

    if (submission.index) {
      this.logger.error('Submission already blockchained', { submissionId });
      return;
    }

    const previousSubmission = await this.db.submissions.findOne({
      index: index - 1
    });

    const precedingHash = previousSubmission.hash

    const customerHoldings = await this.db.customerHoldings.find({ submissionId }, {
      projection: {
        hashedEmail: 1,
        amount: 1
      }
    });

    const hash = getHash(JSON.stringify({
      initialNodeAddress: submission.initialNodeAddress,
      index: index,
      paymentAddress: submission.paymentAddress,
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
      hash, index, precedingHash
    });

    await this.nodeService.updateStatus(false, this.apiConfigService.nodeAddress, await this.syncService.getSyncRequest());
  }

  async confirmSubmission(confirmingNodeAddress: string, confirmation: SubmissionConfirmationMessage) {
    try {
      const submission = await this.db.submissions.findOne({
        hash: confirmation.submissionHash
      });
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
    } catch (err) {
      this.logger.error('Failed to process submission confirmation', confirmation);
    }

  }

}
