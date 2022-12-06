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
import { SubmissionDto, SubmissionStatusDto } from '@bcr/types';
import { SubmissionService } from './submission.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { importSubmissionFile } from './import-submission-file';

@ApiTags('submission')
@Controller('submission')
export class SubmissionController {
  constructor(private submissionService: SubmissionService) {
  }

  @Post('submit')
  @ApiBody({
    type: SubmissionDto
  })
  async submitHoldings(
    @Body() submission: SubmissionDto
  ): Promise<SubmissionStatusDto> {
    return this.submissionService.submitHoldings(submission);
  }

  @Get('status/:address')
  @ApiResponse({ type: SubmissionStatusDto })
  async getSubmissionStatus(
    @Param('address') paymentAddress: string
  ): Promise<SubmissionStatusDto> {
    return await this.submissionService.getSubmissionStatus(paymentAddress);
  }

  @Post('submit-csv')
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
      this.submissionService,
      body.exchangeName
    );
  }
}
