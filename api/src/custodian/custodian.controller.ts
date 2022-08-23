import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CustomerHoldingsDto, SubmissionResult, RegistrationCheckResult } from '@bcr/types';
import { CustodianService } from './custodian.service';

@ApiTags('custodian')
@Controller('custodian')
export class CustodianController {
  constructor(
    private custodianService: CustodianService
  ) {
  }

  @Post('submit-holdings')
  @ApiBody({
    type: CustomerHoldingsDto
  })
  async submitCustodianHoldings(
    @Body() body: CustomerHoldingsDto
  ): Promise<SubmissionResult> {
    return this.custodianService.submitCustodianHoldings(body);
  }

  @Get('check-registration')
  @ApiResponse({type: RegistrationCheckResult})
  async checkRegistration(
    @Query('pk') publicKey: string
  ): Promise<RegistrationCheckResult> {
    return {isRegistered: await this.custodianService.checkRegistration(publicKey)};
  }

}
