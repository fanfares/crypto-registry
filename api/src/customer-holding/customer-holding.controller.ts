import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { HashedEmailDto, WalletVerificationDto } from '@bcr/types';
import { CustomerHoldingService } from './customer-holding.service';
import { CustodianWalletService } from '../custodian-wallet';

@ApiTags('customer-holding')
@Controller('customer-holding')
export class CustomerHoldingController {

  constructor(
    private customerHoldingService: CustomerHoldingService,
    private custodianWalletService: CustodianWalletService
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
    return this.custodianWalletService.get(customHolding.custodianWalletId);
  }

}
