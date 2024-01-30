import { CreateRegisteredAddressDto, FundingSubmissionStatus } from '@bcr/types';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { DbService } from '../db/db.service';
import { ApiConfigService } from '../api-config';
import { Bip84Utils } from '../crypto';

@Injectable()
export class RegisteredAddressService {
  constructor(
    protected bitcoinServiceFactory: BitcoinServiceFactory,
    protected apiConfigService: ApiConfigService,
    protected logger: Logger,
    protected db: DbService
  ) {
  }

  async retrieveBalances(fundingSubmissionId: string) {

    await this.db.fundingSubmissions.update(fundingSubmissionId, {
      status: FundingSubmissionStatus.PROCESSING
    });

    const submission = await this.db.fundingSubmissions.get(fundingSubmissionId);
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

    this.logger.log('updating funding submission', {
      id: fundingSubmissionId
    });

    // Shift the isCurrent flag to the latest submission
    await this.db.fundingSubmissions.updateMany({
      isCurrent: true,
      exchangeId: submission.exchangeId,
      network: submission.network
    }, {
      isCurrent: false
    });

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
