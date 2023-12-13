import { SubmissionWallet } from '@bcr/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { WalletService } from '../crypto/wallet.service';
import { ApiConfigService } from '../api-config';
import { Bip84Utils } from '../crypto/bip84-utils';

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

    const addresses = wallets.map(w => w.address);
    for (const address of addresses) {

      const existingSubmissions = await this.db.submissions.find({
        wallets: {
          $elemMatch: {address}
        },
        _id: {$ne: submissionId},
        isCurrent: true
      });

      const existingSubmissionIds = existingSubmissions.map(s => s._id);

      if (existingSubmissions.length) {
        await this.db.submissions.updateMany({
          _id: {$in: existingSubmissionIds}
        }, {
          isCurrent: false
        });

        await this.db.customerHoldings.updateMany({
          submissionId: {$in: existingSubmissionIds}
        }, {
          isCurrent: false
        });
      }
    }
  }

  async retrieveWalletBalances(submissionId: string) {
    const submission = await this.db.submissions.get(submissionId);
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    if (!bitcoinService) {
      throw new BadRequestException('Node is not configured for network ' + submission.network);
    }

    await bitcoinService.testService();
    let totalBalance = 0;
    for (const submissionWallet of submission.wallets) {
      const balance = await bitcoinService.getAddressBalance(submissionWallet.address);
      submissionWallet.balance = balance;
      totalBalance += balance;
    }

    await this.db.submissions.update(submission._id, {
      totalExchangeFunds: totalBalance,
      wallets: submission.wallets
    });
  }

  validateSignatures(
    walletAddresses: SubmissionWallet[],
    signatureMessage: string
  ): boolean {
    for (const walletAddress of walletAddresses) {
      if (!Bip84Utils.verify({
        signature: walletAddress.signature,
        address: walletAddress.address,
        message: signatureMessage
      })) {
        return false;
      }
    }
    return true;
  }


}
