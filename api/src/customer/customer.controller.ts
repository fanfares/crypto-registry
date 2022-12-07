import { BadRequestException, Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EmailDto } from '@bcr/types';
import { CustomerHoldingsDbService } from './customer-holdings-db.service';
import { MailService, VerifiedHoldings } from '../mail-service';
import { getHash } from '../utils';
import { ApiConfigService } from '../api-config';
import { SubmissionDbService } from '../submission';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {
  constructor(
    private customerHoldingDbService: CustomerHoldingsDbService,
    private submissionDbService: SubmissionDbService,
    private mailService: MailService,
    private logger: Logger,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Post('verify')
  async verifyHoldings(@Body() body: EmailDto): Promise<void> {

    const hashedEmail = getHash(body.email, this.apiConfigService.hashingAlgorithm);
    const customerHoldings = await this.customerHoldingDbService.find({ hashedEmail });

    if (customerHoldings.length === 0) {
      throw new BadRequestException('There are no holdings submitted for this email');
    }

    const verifiedHoldings: VerifiedHoldings[] = [];
    for (const customerHolding of customerHoldings) {
      const submission = await this.submissionDbService.findOne({
        paymentAddress: customerHolding.submissionAddress
      });

      if (!submission) {
        throw new BadRequestException(`Cannot find submission for ${customerHolding.submissionAddress}`);
      }

      verifiedHoldings.push({
        customerHoldingAmount: customerHolding.amount,
        exchangeName: submission.exchangeName
      });
    }

    if (verifiedHoldings.length === 0) {
      throw new BadRequestException('There are no verified holdiings for this email');
    }

    try {
      await this.mailService.sendVerificationEmail(body.email, verifiedHoldings);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException('We found verified holdings, but were unable to send an email to this address');
    }
  }
}
