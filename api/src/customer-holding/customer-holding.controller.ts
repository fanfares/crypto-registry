import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';
import { HashedEmailDto, WalletVerificationDto, SendTestEmailDto } from '@bcr/types';
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
  @ApiResponse({type: WalletVerificationDto})
  async verifyWallet(
    @Body() body: HashedEmailDto
  ): Promise<WalletVerificationDto> {
    // todo - customers could have holdings in more than one wallet/exchange
    const customHolding = await this.customerHoldingService.findOne({hashedEmail: body.hashedEmail});

    if (!customHolding) {
      throw new BadRequestException('Cannot find customer holding');
    }

    // todo - send an email
    return {
      ...await this.custodianWalletService.get(customHolding.custodianWalletId),
      customerBalance: customHolding.amount
    };
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
