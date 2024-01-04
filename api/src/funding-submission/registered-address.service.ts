import { FundingSubmissionStatus, CreateRegisteredAddressDto } from '@bcr/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Bip84Utils } from '../crypto/bip84-utils';

@Injectable()
export class RegisteredAddressService {
  constructor(
    protected bitcoinServiceFactory: BitcoinServiceFactory,
    protected apiConfigService: ApiConfigService,
    protected logger: Logger,
    protected db: DbService
  ) {
  }

  //
  // async cancelPreviousSubmissions(
  //   wallets: SubmissionWallet[],
  //   submissionId: string
  // ) {
  //
  //   const addresses = wallets.map(w => w.address);
  //   for (const address of addresses) {
  //
  //     const existingSubmissions = await this.db.submissions.find({
  //       wallets: {
  //         $elemMatch: {address}
  //       },
  //       _id: {$ne: submissionId},
  //       isCurrent: true
  //     });
  //
  //     const existingSubmissionIds = existingSubmissions.map(s => s._id);
  //
  //     if (existingSubmissions.length) {
  //       await this.db.submissions.updateMany({
  //         _id: {$in: existingSubmissionIds}
  //       }, {
  //         isCurrent: false
  //       });
  //
  //       await this.db.customerHoldings.updateMany({
  //         submissionId: {$in: existingSubmissionIds}
  //       }, {
  //         isCurrent: false
  //       });
  //     }
  //   }
  // }

  async retrieveBalances(addressSubmissionId: string) {
    const submission = await this.db.fundingSubmissions.get(addressSubmissionId);
    const bitcoinService = this.bitcoinServiceFactory.getService(submission.network);
    if (!bitcoinService) {
      throw new BadRequestException('Node is not configured for network ' + submission.network);
    }

    await bitcoinService.testService();
    let totalBalance = 0;
    for (const submissionWallet of submission.addresses) {
      const balance = await bitcoinService.getAddressBalance(submissionWallet.address);
      submissionWallet.balance = balance;
      totalBalance += balance;
    }

    // Shift the isCurrent flag to the latest submission
    await this.db.fundingSubmissions.updateMany({
      isCurrent: true,
      exchangeId: submission.exchangeId,
      network: submission.network
    }, {
      isCurrent: false
    })

    await this.db.fundingSubmissions.update(submission._id, {
      totalFunds: totalBalance,
      addresses: submission.addresses,
      isCurrent: true,
      status: FundingSubmissionStatus.ACCEPTED
    });

  }

  validateSignatures(
    addresses: CreateRegisteredAddressDto[],
    signatureMessage: string
  ): boolean {
    for (const address of addresses) {
      if (!Bip84Utils.verify({
        signature: address.signature,
        address: address.address,
        message: signatureMessage
      })) {
        return false;
      }
    }
    return true;
  }


}
