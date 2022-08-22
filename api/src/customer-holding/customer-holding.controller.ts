import { Controller, Post, Body, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EmailDto, SendTestEmailDto, VerificationDto, VerificationResult } from '@bcr/types';
import { CustomerHoldingService } from './customer-holding.service';
import { CustodianWalletService } from '../custodian-wallet';
import { MailService } from '../mail/mail.service';

@ApiTags('customer-holding')
@Controller('customer-holding')
export class CustomerHoldingController {

  constructor(
    private customerHoldingService: CustomerHoldingService,
    private custodianWalletService: CustodianWalletService,
    private mailService: MailService
  ) {
  }

  @Post('verify')
  @ApiResponse({type: VerificationResult})
  async verifyWallet(
    @Body() body: EmailDto
  ): Promise<VerificationResult> {
    // todo - customers could have holdings in more than one wallet/exchange
    const customerHolding = await this.customerHoldingService.findOne({hashedEmail: body.email});

    if (!customerHolding) {
      return VerificationResult.CANT_FIND_VERIFIED_HOLDING
    }

    const custodianWallet = await this.custodianWalletService.get(customerHolding._id);
    if ( !custodianWallet) {
      throw new InternalServerErrorException('Cannot find custodian wallet')
    }

    try {
      await this.mailService.sendVerificationEmail(body.email, custodianWallet, customerHolding )
    } catch ( err ){
      return VerificationResult.FAILED_TO_SEND_EMAIL
    }

    return VerificationResult.EMAIL_SENT;
  }

  @Post('send-test-email')
  @ApiBody({type: SendTestEmailDto})
  async sendTestEmail(
    @Body() body: SendTestEmailDto
  ) {
    try {
      await this.mailService.sendTestEmail(body.email, 'Rob');
    } catch ( err) {
      throw new BadRequestException(err.message);
    }
  }

}
