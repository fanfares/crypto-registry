import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { CustomerHoldingsDto, SubmissionResult, RegistrationCheckResult, CustodianDto } from '@bcr/types';
import { CustodianService } from './custodian.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { importSubmissionFile } from './submission-file-processor';

@ApiTags('custodian')
@Controller('custodian')
export class CustodianController {
  constructor(
    private custodianService: CustodianService
  ) {
  }

  @Get()
  @ApiResponse({type: CustodianDto, isArray: true})
  async getCustodians(): Promise<CustodianDto[]> {
    return this.custodianService.getCustodianDtos();
  }

  @Post('submit-holdings')
  @ApiBody({
    type: CustomerHoldingsDto
  })
  async submitCustodianHoldings(
    @Body() body: CustomerHoldingsDto
  ): Promise<SubmissionResult> {
    return this.custodianService.submitCustodianHoldings(body.customerHoldings);
  }

  @Get('check-registration')
  @ApiResponse({type: RegistrationCheckResult})
  async checkRegistration(
    @Query('pk') publicKey: string
  ): Promise<RegistrationCheckResult> {
    return await this.custodianService.checkRegistration(publicKey);
  }

  @Post('submit-holdings-csv')
  @UseInterceptors(FileInterceptor('File'))
  async submitCustomersHoldingsCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({maxSize: 10000}),
          new FileTypeValidator({fileType: 'csv'})
        ]
      })
    ) file: Express.Multer.File
  ) {
    await importSubmissionFile(file.buffer, this.custodianService);
    return {
      ok: true
    };
  }

}
