import { Controller, Post, Body, InternalServerErrorException, Logger } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { EmailDto, VerificationResult, VerificationDto } from '@bcr/types';
import { CustomerHoldingsDbService } from './customer-holdings-db.service';
import { CustodianDbService } from '../custodian';
import { MailService, VerifiedHoldings } from '../mail/mail.service';

@ApiTags('customer')
@Controller('customer')
export class CustomerController {

  constructor(
    private customerHoldingDbService: CustomerHoldingsDbService,
    private custodianDbService: CustodianDbService,
    private mailService: MailService,
    private logger: Logger
  ) {
  }

  @Post('verify-holdings')
  @ApiResponse({type: VerificationDto})
  async verifyHoldings(
    @Body() body: EmailDto
  ): Promise<VerificationDto> {
    // todo - customers could have holdings in more than one wallet/exchange
    const customerHoldings = await this.customerHoldingDbService.find({hashedEmail: body.email});

    if (customerHoldings.length === 0) {
      return {verificationResult: VerificationResult.CANT_FIND_HOLDINGS_FOR_EMAIL};
    }

    const verifiedHoldings: VerifiedHoldings[] = [];
    for (const customerHolding of customerHoldings) {

      const custodian = await this.custodianDbService.get(customerHolding.custodianId);
      if (!custodian) {
        throw new InternalServerErrorException('Cannot find custodian wallet');
      }

      verifiedHoldings.push({
        customerHoldingAmount: customerHolding.amount,
        custodianName: custodian.custodianName
      });
    }

    if ( verifiedHoldings.length === 0 ) {
      return { verificationResult: VerificationResult.CANT_FIND_VERIFIED_HOLDINGS_FOR_EMAIL}
    }

    try {
      await this.mailService.sendVerificationEmail(body.email, verifiedHoldings);
    } catch (err) {
      this.logger.error(new Error(err));
      return {verificationResult: VerificationResult.FAILED_TO_SEND_EMAIL};
    }

    return {verificationResult: VerificationResult.EMAIL_SENT};
  }
}
