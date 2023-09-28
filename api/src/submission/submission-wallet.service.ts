import { Network, SubmissionStatus, SubmissionWallet, SubmissionWalletStatus } from '@bcr/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { WalletService } from '../crypto/wallet.service';
import { ApiConfigService } from '../api-config';
import { minimumBitcoinPaymentInSatoshi } from '../utils';

@Injectable()
export class SubmissionWalletService {
  constructor(
    protected bitcoinServiceFactory: BitcoinServiceFactory,
    protected walletService: WalletService,
    protected apiConfigService: ApiConfigService,
    protected logger: Logger,
    protected db: DbService
  ) {
  }

  async cancelPreviousSubmissions(
    wallets: SubmissionWallet[],
    submissionId: string
  ) {

    const exchangeZpubs = wallets.map(w => w.exchangeZpub);
    for (const exchangeZpub of exchangeZpubs) {

      const existingSubmissions = await this.db.submissions.find({
        wallets: {
          $elemMatch: { exchangeZpub: exchangeZpub },
        },
        _id: { $ne: submissionId },
        isCurrent: true
      });

      const existingSubmissionIds = existingSubmissions.map(s => s._id)

      if (existingSubmissions.length ) {
        await this.db.submissions.updateMany({
          _id: { $in: existingSubmissionIds }
        }, {
          isCurrent: false
        });

        await this.db.customerHoldings.updateMany({
          submissionId: { $in: existingSubmissionIds }
        }, {
          isCurrent: false
        });
      }
    }
  }

  async retrieveWalletBalances(submissionId: string) {
    const submission = await this.db.submissions.get(submissionId);
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    if ( !bitcoinService ) {
      throw new BadRequestException('Node is not configured for network ' + submission.network);
    }

    await bitcoinService.testService();
    let totalBalance = 0;
    for (const submissionWallet of submission.wallets) {
      const balance = await bitcoinService.getWalletBalance(submissionWallet.exchangeZpub);
      submissionWallet.balance = balance;
      submissionWallet.status = SubmissionWalletStatus.WAITING_FOR_PAYMENT_ADDRESS;
      totalBalance += balance;
    }

    const totalPaymentAmount = Math.max(submission.totalCustomerFunds * this.apiConfigService.paymentPercentage, minimumBitcoinPaymentInSatoshi);
    for (const submissionWallet of submission.wallets) {
      submissionWallet.paymentAmount = Math.round(submissionWallet.balance / totalBalance * totalPaymentAmount);
    }

    await this.db.submissions.update(submission._id, {
      totalExchangeFunds: totalBalance,
      wallets: submission.wallets
    });
  }

  async assignPaymentAddresses(
    submissionId: string
  ) {
    const submission = await this.db.submissions.get(submissionId);
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    if (!bitcoinService) {
      throw new BadRequestException('Node is not configured for network ' + submission.network);
    }

    for (const wallet of submission.wallets) {
      bitcoinService.validateZPub(wallet.exchangeZpub);
      const paymentAddress = await this.walletService.getReceivingAddress(this.apiConfigService.getRegistryZpub(submission.network));
      wallet.paymentAddress = paymentAddress.address;
      wallet.paymentAddressIndex = paymentAddress.index;
      wallet.status = SubmissionWalletStatus.WAITING_FOR_PAYMENT;
    }

    await this.db.submissions.update(submissionId, {
      wallets: submission.wallets
    });
  }

  async storePaymentAddresses(
    wallets: SubmissionWallet[],
    network: Network
  ) {
    for (const wallet of wallets) {
      await this.walletService.storeReceivingAddress({
        network: network,
        zpub: this.apiConfigService.getRegistryZpub(network),
        address: wallet.paymentAddress,
        index: wallet.paymentAddressIndex
      });
    }
  }

  async waitForPayments(submissionId: string) {
    const submission = await this.db.submissions.get(submissionId);
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    for (const wallet of submission.wallets) {
      const senderAmount = await bitcoinService.getAmountSentBySender(wallet.paymentAddress, wallet.exchangeZpub);
      if (senderAmount.noTransactions) {
        this.logger.log(`No transactions found yet, for submission ${submission._id}, wallet ${wallet.paymentAddress}`);
        return;
      }
      if (senderAmount.senderMismatch) {
        wallet.status = SubmissionWalletStatus.SENDER_MISMATCH;
      }
      if (senderAmount.valueOfOutputFromSender >= wallet.paymentAmount) {
        wallet.status = SubmissionWalletStatus.PAID;
      }
    }

    let submissionStatus = SubmissionStatus.WAITING_FOR_CONFIRMATION;

    for (const wallet of submission.wallets) {
      if (wallet.status === SubmissionWalletStatus.SENDER_MISMATCH) {
        submissionStatus = SubmissionStatus.SENDER_MISMATCH;
        break;
      }
      if (wallet.status === SubmissionWalletStatus.WAITING_FOR_PAYMENT) {
        submissionStatus = SubmissionStatus.WAITING_FOR_PAYMENT;
        break;
      }
    }

    await this.db.submissions.update(submission._id, {
      status: submissionStatus,
      wallets: submission.wallets
    });
  }

}
