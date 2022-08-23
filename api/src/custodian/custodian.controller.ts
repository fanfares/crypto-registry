import { Controller, Get, Post, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CustomerHoldingsDto, SubmissionResult, RegistrationCheckResult } from '@bcr/types';
import { CustodianService } from './custodian.service';
import { FileInterceptor } from '@nestjs/platform-express';

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

  @Post('submit-holdings-csv')
  @UseInterceptors(FileInterceptor('File'))
  submitCustomersHoldingsCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body() otherData: any
  ) {
    console.log(otherData['Other']);
    console.log(file.buffer.toString());
  }

}
