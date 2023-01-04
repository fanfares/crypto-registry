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
import { CreateSubmissionDto, SubmissionStatusDto, AddressDto, CreateSubmissionCsvDto } from '@bcr/types';
import { SubmissionService } from './submission.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { importSubmissionFile } from './import-submission-file';

@ApiTags('submission')
@Controller('submission')
export class SubmissionController {
  constructor(private submissionService: SubmissionService) {
  }

  @Post()
  @ApiBody({ type: CreateSubmissionDto })
  async createSubmission(
    @Body() submission: CreateSubmissionDto
  ): Promise<SubmissionStatusDto> {
    return this.submissionService.createSubmission(submission);
  }

  @Post('cancel')
  @ApiBody({ type: AddressDto })
  async cancelSubmission(
    @Body() body: AddressDto
  ): Promise<void> {
    return this.submissionService.cancel(body.address);
  }

  @Get(':address')
  @ApiResponse({ type: SubmissionStatusDto })
  async getSubmissionStatus(
    @Param('address') paymentAddress: string
  ): Promise<SubmissionStatusDto> {
    return await this.submissionService.getSubmissionStatus(paymentAddress);
  }

  @Post('submit-csv')
  @UseInterceptors(FileInterceptor('File'))
  @ApiBody({ type: CreateSubmissionCsvDto })
  async submitCustomersHoldingsCsv(
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 10000 }),
        new FileTypeValidator({ fileType: 'csv' })
      ]
    })) file: Express.Multer.File,
    @Body() body: CreateSubmissionCsvDto
  ) {
    return await importSubmissionFile(
      file.buffer,
      this.submissionService,
      body.exchangeZpub,
      body.exchangeName,
      body.network
    );
  }
}
