import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {ApiBody, ApiResponse, ApiTags} from '@nestjs/swagger';
import {
  ChainStatus,
  CreateSubmissionCsvDto,
  CreateSubmissionDto,
  PaymentAddressDto,
  SubmissionDto,
  SubmissionRecord
} from '@bcr/types';
import {SubmissionService} from './submission.service';
import {FileInterceptor} from '@nestjs/platform-express';
import {importSubmissionFile} from './import-submission-file';
import {MessageSenderService} from '../network/message-sender.service';
import {IsAuthenticatedGuard} from '../user/is-authenticated.guard';
import {User} from '../utils/user.decorator';
import {UserRecord} from '../types/user.types';
import {ApiConfigService} from '../api-config';
import {DbService} from '../db/db.service';

@ApiTags('submission')
@Controller('submission')
@UseGuards(IsAuthenticatedGuard)
export class SubmissionController {
  constructor(
    private submissionService: SubmissionService,
    private messageSenderService: MessageSenderService,
    private apiConfigService: ApiConfigService,
    private db: DbService
  ) {
  }

  @Get('verify-chain')
  @ApiResponse({ type: ChainStatus })
  async verifyChain(): Promise<ChainStatus> {

    const submissions = await this.db.submissions.find({}, {
      sort: {
        index: 1
      }
    });

    let previousLink: SubmissionRecord;
    let brokenLink: SubmissionRecord
    for (const submission of submissions) {
      if (previousLink) {
        if (submission.precedingHash !== previousLink.hash) {
          brokenLink = submission;
          break;
        }
      }
      previousLink = submission;
    }

    return {
      isVerified: !brokenLink,
      brokenLinkVerificationId: brokenLink?._id
    };
  }

  @Post()
  @ApiBody({ type: CreateSubmissionDto })
  async createSubmission(
    @Body() submission: CreateSubmissionDto
  ): Promise<SubmissionDto> {
    return await this.submissionService.createSubmission(submission);
  }

  @Post('cancel')
  @ApiBody({ type: PaymentAddressDto })
  async cancelSubmission(
    @Body() body: PaymentAddressDto
  ): Promise<void> {
    const submission = await this.db.submissions.findOne({ paymentAddress: body.address })
    if ( submission.initialNodeAddress !== this.apiConfigService.nodeAddress ) {
      throw new BadRequestException('Only the originating node can cancel a subsmission')
    }
    await this.submissionService.cancel(body.address);
    await this.messageSenderService.broadcastCancelSubmission( body.address);
  }

  @Get(':address')
  @ApiResponse({ type: SubmissionDto })
  async getSubmissionStatus(
    @Param('address') paymentAddress: string
  ): Promise<SubmissionDto> {
    return await this.submissionService.getSubmissionStatus(paymentAddress);
  }

  @Post('submit-csv')
  @UseInterceptors(FileInterceptor('File'))
  @ApiBody({ type: CreateSubmissionCsvDto })
  async submitCustomersHoldingsCsv(
    @User() user: UserRecord,
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
      this.apiConfigService.nodeAddress
    );
  }


}
