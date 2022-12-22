import { BadRequestException, Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailDto, SubmissionStatus } from '@bcr/types';
import { MailService, VerifiedHoldings } from '../mail-service';
import { getHash } from '../utils';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { differenceInDays } from 'date-fns';
import { BitcoinService } from '../crypto';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(
    private db: DbService,
    private mailService: MailService,
    private logger: Logger,
    private apiConfigService: ApiConfigService,
    private bitcoinService: BitcoinService
  ) {
  }

  @Post('verify')
  async verifyHoldings(@Body() body: EmailDto): Promise<void> {

    const hashedEmail = getHash(body.email, this.apiConfigService.hashingAlgorithm);
    const customerHoldings = await this.db.customerHoldings.find({ hashedEmail, isCurrent: true });

    if (customerHoldings.length === 0) {
      throw new BadRequestException('There are no holdings submitted for this email');
    }

    const verifiedHoldings: VerifiedHoldings[] = [];
    for (const customerHolding of customerHoldings) {
      const submission = await this.db.submissions.findOne({
        paymentAddress: customerHolding.paymentAddress
      });

      if (!submission) {
        throw new BadRequestException(`Cannot find submission for ${customerHolding.paymentAddress}`);
      }

      const totalExchangeFunds = await this.bitcoinService.getWalletBalance(submission.exchangeZpub);
      const sufficientFunds = totalExchangeFunds >= (submission.totalCustomerFunds * this.apiConfigService.reserveLimit);

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

    try {
      await this.mailService.sendVerificationEmail(body.email, verifiedHoldings);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('We found verified holdings, but were unable to send an email to this address');
    }
  }
}
