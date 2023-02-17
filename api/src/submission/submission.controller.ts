import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile, UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubmissionDto, SubmissionStatusDto, AddressDto, CreateSubmissionCsvDto, MessageType } from '@bcr/types';
import { SubmissionService } from './submission.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { importSubmissionFile } from './import-submission-file';
import { MessageSenderService } from '../network/message-sender.service';
import { IsSignedInGuard } from '../user/is-signed-in.guard';

@ApiTags('submission')
@Controller('submission')
@UseGuards(IsSignedInGuard)
export class SubmissionController {
  constructor(
    private submissionService: SubmissionService,
    private messageSenderService: MessageSenderService
  ) {
  }

  @Post()
  @ApiBody({ type: CreateSubmissionDto })
  async createSubmission(
    @Body() submission: CreateSubmissionDto
  ): Promise<SubmissionStatusDto> {
    const submissionStatusDto = await this.submissionService.createSubmission(submission);
    const broadcastSubmissions: CreateSubmissionDto = {
      ...submission,
      paymentAddress: submissionStatusDto.paymentAddress
    };
    await this.messageSenderService.broadcastSubmission(broadcastSubmissions);
    return submissionStatusDto;
  }

  @Post('cancel')
  @ApiBody({ type: AddressDto })
  async cancelSubmission(
    @Body() body: AddressDto
  ): Promise<void> {
    await this.submissionService.cancel(body.address);
    await this.messageSenderService.sendBroadcastMessage(MessageType.submissionCancellation, body.address);
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
      this.messageSenderService,
      body.exchangeZpub,
      body.exchangeName,
      body.network
    );
  }
}
