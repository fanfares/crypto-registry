import { BadRequestException, Body, Controller, Logger, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { EmailDto, VerificationDto, VerificationResult } from '@bcr/types';
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
  @ApiResponse({ type: VerificationDto })
  async verifyHoldings(@Body() body: EmailDto): Promise<VerificationDto> {

    const hashedEmail = getHash(body.email, this.apiConfigService.hashingAlgorithm);
    const customerHoldings = await this.customerHoldingDbService.find({
      hashedEmail: hashedEmail
    });

    if (customerHoldings.length === 0) {
      return {
        verificationResult: VerificationResult.CANT_FIND_HOLDINGS_FOR_EMAIL
      };
    }

    const verifiedHoldings: VerifiedHoldings[] = [];
    for (const customerHolding of customerHoldings) {
      const submission = await this.submissionDbService.findOne({
        paymentAddress: customerHolding.submissionAddress
      });
      if (!submission) {
        throw new BadRequestException('Cannot find exchange submission');
      }

      verifiedHoldings.push({
        customerHoldingAmount: customerHolding.amount,
        exchangeName: submission.exchangeName
      });
    }

    if (verifiedHoldings.length === 0) {
      return {
        verificationResult:
        VerificationResult.CANT_FIND_VERIFIED_HOLDINGS_FOR_EMAIL
      };
    }

    try {
      await this.mailService.sendVerificationEmail(
        body.email,
        verifiedHoldings
      );
    } catch (err) {
      this.logger.error(new Error(err));
      return { verificationResult: VerificationResult.FAILED_TO_SEND_EMAIL };
    }

    return { verificationResult: VerificationResult.EMAIL_SENT };
  }
}
