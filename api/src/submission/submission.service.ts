import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApiConfigService } from '../api-config';
import { CreateSubmissionDto, CustomerHolding, SubmissionStatus, SubmissionStatusDto } from '@bcr/types';
import { submissionStatusRecordToDto } from './submission-record-to-dto';
import { getHash, minimumBitcoinPaymentInSatoshi } from '../utils';
import { WalletService } from '../crypto/wallet.service';
import { isTxsSendersFromWallet } from '../crypto/is-tx-sender-from-wallet';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { getNetworkForZpub } from '../crypto/get-network-for-zpub';
import { SubmissionConfirmationMessage } from '../types/submission-confirmation.types';

@Injectable()
export class SubmissionService {
  constructor(
    private db: DbService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private apiConfigService: ApiConfigService,
    private walletService: WalletService,
    private logger: Logger
  ) {
  }

  async getSubmissionStatus(
    paymentAddress: string
  ): Promise<SubmissionStatusDto> {
    const submission = await this.db.submissions.findOne({
      paymentAddress
    });
    const confirmations = await this.db.submissionConfirmations.find({
      submissionId: submission._id
    })
    if (!submission) {
      throw new BadRequestException('Invalid Address');
    }

    if (submission.status === SubmissionStatus.VERIFIED || submission.status === SubmissionStatus.CANCELLED) {
      return submissionStatusRecordToDto(submission, confirmations);
    }

    let status: SubmissionStatus;
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    const txs = await bitcoinService.getTransactionsForAddress(paymentAddress);
    if (txs.length === 0) {
      status = SubmissionStatus.WAITING_FOR_PAYMENT;
    } else if (!isTxsSendersFromWallet(txs, submission.exchangeZpub)) {
      status = SubmissionStatus.SENDER_MISMATCH;
    } else {
      const addressBalance = await bitcoinService.getAddressBalance(paymentAddress);
      if (addressBalance < submission.paymentAmount) {
        status = SubmissionStatus.WAITING_FOR_PAYMENT;
      } else {
        status = SubmissionStatus.VERIFIED;
      }
    }

    await this.db.submissions.update(submission._id, { status: status });
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
  ): Promise<SubmissionStatusDto> {
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

    const previousBlock = await this.db.submissions.findOne({}, {
      sort: {
        createdDate: -1
      },
      limit: 1
    });

    const precedingHash = previousBlock?.hash ?? 'genesis';
    const hash = getHash(JSON.stringify({
      initialNodeAddress: submission.initialNodeAddress,
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

    await this.db.submissions.insert({
      initialNodeAddress: submission.initialNodeAddress,
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

    return {
      initialNodeAddress: submission.initialNodeAddress,
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
