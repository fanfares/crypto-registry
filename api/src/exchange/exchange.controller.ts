import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExchangeDto, SubmissionDto, SubmissionStatusDto } from '@bcr/types';
import { ExchangeService } from './exchange.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { importSubmissionFile } from './submission-file-processor';

@ApiTags('exchange')
@Controller('exchange')
export class ExchangeController {
  constructor(private exchangeService: ExchangeService) {
  }

  @Get()
  @ApiResponse({ type: ExchangeDto, isArray: true })
  async getAllExchanges(): Promise<ExchangeDto[]> {
    return this.exchangeService.getExchanges();
  }

  @Post('submit-holdings')
  @ApiBody({
    type: SubmissionDto
  })
  async submitHoldings(
    @Body() submission: SubmissionDto
  ): Promise<SubmissionStatusDto> {
    return this.exchangeService.submitHoldings(submission);
  }

  @Get('submission-status/:address')
  @ApiResponse({ type: SubmissionStatusDto })
  async getSubmissionStatus(
    @Param('address') paymentAddress: string
  ): Promise<SubmissionStatusDto> {
    return await this.exchangeService.getSubmissionStatus(paymentAddress);
  }

  @Post('submit-holdings-csv')
  @UseInterceptors(FileInterceptor('File'))
  async submitCustomersHoldingsCsv(
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 10000 }),
        new FileTypeValidator({ fileType: 'csv' })
      ]
    })) file: Express.Multer.File,
    @Body() body // todo - type this.
  ) {
    return await importSubmissionFile(
      file.buffer,
      this.exchangeService,
      body.exchangeName
    );
  }
}
