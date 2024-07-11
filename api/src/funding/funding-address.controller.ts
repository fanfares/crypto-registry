import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import {
  FundingAddressDto,
  FundingAddressQueryDto,
  FundingAddressQueryResultDto,
  FundingAddressRefreshRequestDto,
  UserRecord
} from '@bcr/types';
import { User } from '../auth';
import { IsExchangeUserGuard } from '../exchange/is-exchange-user.guard';
import { FundingAddressService } from './funding-address.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('funding-address')
@UseGuards(IsExchangeUserGuard)
@ApiTags('funding-address')
export class FundingAddressController {

  constructor(
    private fundingAddressService: FundingAddressService
  ) {
  }

  @Post('query')
  @ApiResponse({type: FundingAddressQueryResultDto})
  async query(
    @User() user: UserRecord,
    @Body() query: FundingAddressQueryDto
  ): Promise<FundingAddressQueryResultDto> {
    return this.fundingAddressService.query(user, query);
  }

  @Delete(':address')
  async deleteAddress(
    @User() user: UserRecord,
    @Param('address') address: string
  ) {
    await this.fundingAddressService.deleteAddress(user, address);
  }

  @Post('refresh')
  @ApiResponse({type: FundingAddressDto})
  async refreshAddress(
    @Body() request: FundingAddressRefreshRequestDto,
    @User() user: UserRecord
  ): Promise<FundingAddressDto> {
    return await this.fundingAddressService.refreshAddress(request.address, user);
  }
}
