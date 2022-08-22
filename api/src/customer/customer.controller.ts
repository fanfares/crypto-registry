import { Controller, Post, Body, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { EmailDto, SendTestEmailDto, VerificationResult, VerificationDto } from '@bcr/types';
import { CustomerHoldingsDbService } from './customer-holdings-db.service';
import { CustodianDbService } from '../custodian';
import { MailService } from '../mail/mail.service';

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
    const customerHolding = await this.customerHoldingDbService.findOne({hashedEmail: body.email});

    if (!customerHolding) {
      return {verificationResult: VerificationResult.CANT_FIND_VERIFIED_HOLDING};
    }

    const custodian = await this.custodianDbService.get(customerHolding.custodianId);
    if (!custodian) {
      throw new InternalServerErrorException('Cannot find custodian wallet');
    }

    try {
      await this.mailService.sendVerificationEmail(body.email, custodian, customerHolding);
    } catch (err) {
      this.logger.error(new Error(err));
      return {verificationResult: VerificationResult.FAILED_TO_SEND_EMAIL};
    }

    return {verificationResult: VerificationResult.EMAIL_SENT};
  }

  @Post('send-test-email')
  @ApiBody({type: SendTestEmailDto})
  async sendTestEmail(
    @Body() body: SendTestEmailDto
  ) {
    try {
      await this.mailService.sendTestEmail(body.email, 'Rob');
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

}
