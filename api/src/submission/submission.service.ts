import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto, CustomerHolding, SubmissionDto, SubmissionStatus } from '@bcr/types';
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
import { getLatestSubmissionBlock } from './get-latest-submission-block';
import { SynchronisationService } from '../syncronisation/synchronisation.service';

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
     })
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
      this.logger.debug('polling for submission payment', { submission })
      if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
        const txs = await bitcoinService.getTransactionsForAddress(submission.paymentAddress);
        if (txs.length === 0) {
          break;
        } else if (!isTxsSendersFromWallet(txs, submission.exchangeZpub)) {
          await this.updateSubmissionStatus(submission._id, SubmissionStatus.SENDER_MISMATCH );
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
            await this.updateSubmissionStatus(submission._id,  confirmationStatus );
            await this.messageSenderService.broadcastSubmissionConfirmation({
              submissionHash: submission.hash,
              confirmed: true
            });
          }
        }
      } else if (submission.status === SubmissionStatus.WAITING_FOR_CONFIRMATION) {
        const confirmationStatus = await this.getConfirmationStatus(submission._id);
        await this.updateSubmissionStatus(submission._id, confirmationStatus );
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
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submission._id
    });
    if (!submission) {
      throw new BadRequestException('Invalid Address');
    }
    const currentSubmission = await this.db.submissions.get(submission._id);
    return submissionStatusRecordToDto(currentSubmission, confirmations);
  }

  async cancel(address: string) {
    await this.db.submissions.findOneAndUpdate({
      paymentAddress: address
    }, {
      status: SubmissionStatus.CANCELLED
    });
  }

  async createSubmission(
    submission: CreateSubmissionDto
  ): Promise<SubmissionDto> {
    const network = getNetworkForZpub(submission.exchangeZpub);
    const bitcoinService = this.bitcoinServiceFactory.getService(network);
    bitcoinService.validateZPub(submission.exchangeZpub);

    const totalExchangeFunds = await bitcoinService.getWalletBalance(submission.exchangeZpub);
    if (totalExchangeFunds === 0) {
      throw new BadRequestException('Exchange Wallet Balance is zero');
    }

    const totalCustomerFunds = submission.customerHoldings.reduce((amount, holding) => amount + holding.amount, 0);
    if (totalExchangeFunds < (totalCustomerFunds * this.apiConfigService.reserveLimit)) {
      const reserveLimit = Math.round(this.apiConfigService.reserveLimit * 100);
      throw new BadRequestException(`Exchange funds are below reserve limit (${reserveLimit}% of customer funds)`);
    }

    const paymentAmount = Math.max(totalCustomerFunds * this.apiConfigService.paymentPercentage, minimumBitcoinPaymentInSatoshi);

    let paymentAddress: string = submission.paymentAddress;
    if (!submission.paymentAddress) {
      paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.getRegistryZpub(network), 'Registry', network);
    }

    const currentSubmission = await this.db.submissions.findOne({
      exchangeZpub: submission.exchangeZpub,
      network: network,
      isCurrent: true
    });

    if (currentSubmission) {
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

    // todo - transactions?
    const previousBlock = await getLatestSubmissionBlock(this.db)
    const newBlockIndex = (previousBlock?.index ?? 0) + 1;
    const precedingHash = previousBlock?.hash ?? 'genesis';
    const hash = getHash(JSON.stringify({
      initialNodeAddress: submission.initialNodeAddress,
      index: newBlockIndex,
      paymentAddress: paymentAddress,
      network: network,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      exchangeName: submission.exchangeName,
      exchangeZpub: submission.exchangeZpub,
      holdings: submission.customerHoldings.map(h => ({
        hashedEmail: h.hashedEmail.toLowerCase(),
        amount: h.amount
      }))
    }) + previousBlock?.hash ?? 'genesis', 'sha256');

    const submissionId = await this.db.submissions.insert({
      initialNodeAddress: submission.initialNodeAddress,
      index: newBlockIndex,
      paymentAddress: paymentAddress,
      network: network,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      totalExchangeFunds: totalExchangeFunds,
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
      exchangeName: submission.exchangeName,
      exchangeZpub: submission.exchangeZpub,
      isCurrent: true,
      precedingHash: precedingHash,
      hash: hash
    });

    const inserts: CustomerHolding[] =
      submission.customerHoldings.map((holding) => ({
        hashedEmail: holding.hashedEmail.toLowerCase(),
        amount: holding.amount,
        paymentAddress: paymentAddress,
        network: network,
        isCurrent: true
      }));

    await this.db.customerHoldings.insertMany(inserts);
    await this.nodeService.setStatus(false, this.apiConfigService.nodeAddress, await this.syncService.getSyncRequest())

    return {
      _id: submissionId,
      initialNodeAddress: submission.initialNodeAddress,
      index: newBlockIndex,
      hash: hash,
      paymentAddress: paymentAddress,
      exchangeZpub: submission.exchangeZpub,
      network: network,
      paymentAmount: paymentAmount,
      totalCustomerFunds: totalCustomerFunds,
      totalExchangeFunds: totalExchangeFunds,
      status: SubmissionStatus.WAITING_FOR_PAYMENT,
      exchangeName: submission.exchangeName,
      isCurrent: true,
      confirmations: []
    };
  }

  async confirmSubmission(confirmingNodeAddress: string, confirmation: SubmissionConfirmationMessage) {
    try {
      const submission = await this.db.submissions.findOne({
        hash: confirmation.submissionHash
      });
      if ( confirmation.submissionHash !== submission.hash ) {
        // blackballed
        await this.nodeService.setNodeBlackBall(confirmingNodeAddress)
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
