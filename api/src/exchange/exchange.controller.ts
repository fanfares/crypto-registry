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
  FileTypeValidator,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  CustomerHoldingsDto,
  SubmissionResult,
  RegistrationCheckResult,
  ExchangeDto,
} from '@bcr/types';
import { ExchangeService } from './exchange.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { importSubmissionFile } from './submission-file-processor';

@ApiTags('exchange')
@Controller('exchange')
export class ExchangeController {
  constructor(private exchangeService: ExchangeService) {}

  @Get()
  @ApiResponse({ type: ExchangeDto, isArray: true })
  async getCustodians(): Promise<ExchangeDto[]> {
    return this.exchangeService.getCustodianDtos();
  }

  @Post('submit-holdings')
  @ApiBody({
    type: CustomerHoldingsDto,
  })
  async submitCustodianHoldings(
    @Body() body: CustomerHoldingsDto,
  ): Promise<SubmissionResult> {
    return this.exchangeService.submitHoldings(body.customerHoldings);
  }

  @Get('check-registration')
  @ApiResponse({ type: RegistrationCheckResult })
  async checkRegistration(
    @Query('pk') publicKey: string,
  ): Promise<RegistrationCheckResult> {
    return await this.exchangeService.checkRegistration(publicKey);
  }

  @Post('submit-holdings-csv')
  @UseInterceptors(FileInterceptor('File'))
  async submitCustomersHoldingsCsv(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000 }),
          new FileTypeValidator({ fileType: 'csv' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    await importSubmissionFile(file.buffer, this.exchangeService);
    return {
      ok: true,
    };
  }
}
