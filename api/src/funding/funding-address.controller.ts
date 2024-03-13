import { Body, Injectable, Post, UseGuards } from '@nestjs/common';
import { FundingAddressQueryDto, UserRecord } from '@bcr/types';
import { User } from '../auth';
import { IsExchangeUserGuard } from '../exchange/is-exchange-user.guard';
import { FundingAddressService } from './funding-address.service';

@Injectable()
@UseGuards(IsExchangeUserGuard)
export class FundingAddressController {

  constructor(
    private fundingAddressService: FundingAddressService
  ) {
  }

  @Post('query')
  async queryFundingAddresses(
    @User() user: UserRecord,
    @Body() query: FundingAddressQueryDto
  ) {
    return this.fundingAddressService.query(user, query);
  }
}
