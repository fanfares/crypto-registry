import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { VerificationRequestDto, SubmissionStatus } from '@bcr/types';
import { getHash } from '../utils';
import { VerifiedHoldings, MailService } from '../mail-service';
import { differenceInDays } from 'date-fns';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { SubmissionService } from '../submission';

@Injectable()
export class VerificationService {

  constructor(
    private dbService: DbService,
    private mailService: MailService,
    private logger: Logger,
    private apiConfigService: ApiConfigService,
    private bitcoinServiceFactory: BitcoinServiceFactory,
    private submissionService: SubmissionService
  ) {
  }

  async verify(
    verificationRequestDto: VerificationRequestDto,
    sendEmail: boolean
  ): Promise<void> {

    const hashedEmail = getHash(verificationRequestDto.email.toLowerCase(), this.apiConfigService.hashingAlgorithm);
    const customerHoldings = await this.dbService.customerHoldings.find({
      hashedEmail: hashedEmail,
      isCurrent: true
    });

    if (customerHoldings.length === 0) {
      throw new BadRequestException('There are no holdings submitted for this email');
    }

    const verifiedHoldings: VerifiedHoldings[] = [];
    for (const customerHolding of customerHoldings) {
      let submission = await this.dbService.submissions.findOne({
        paymentAddress: customerHolding.paymentAddress,
      });

      if (!submission) {
        throw new BadRequestException(`Cannot find submission for ${customerHolding.paymentAddress}`);
      }

      const totalExchangeFunds = await this.bitcoinServiceFactory.getService(submission.network).getWalletBalance(submission.exchangeZpub);
      const sufficientFunds = totalExchangeFunds >= (submission.totalCustomerFunds * this.apiConfigService.reserveLimit);

      if (submission.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        await this.submissionService.getSubmissionStatus(submission.paymentAddress);
        submission = await this.dbService.submissions.findOne({
          paymentAddress: customerHolding.paymentAddress
        });
      }

      if (submission.status === SubmissionStatus.VERIFIED && sufficientFunds && differenceInDays(new Date(), submission.createdDate) < this.apiConfigService.maxSubmissionAge) {
        verifiedHoldings.push({
          customerHoldingAmount: customerHolding.amount,
          exchangeName: submission.exchangeName
        });
      }
    }

    if (verifiedHoldings.length === 0) {
      throw new BadRequestException('There are no verified holdings for this email');
    }

    if (sendEmail) {
      try {
        await this.mailService.sendVerificationEmail(verificationRequestDto.email.toLowerCase(), verifiedHoldings, this.apiConfigService.nodeName, this.apiConfigService.nodeAddress);
      } catch (err) {
        this.logger.error(err);
        throw new BadRequestException('We found verified holdings, but were unable to send an email to this address');
      }
    }
  }
}
