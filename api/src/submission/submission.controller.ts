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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AmountSentBySenderDto,
  ChainStatus,
  CreateSubmissionCsvDto,
  CreateSubmissionDto,
  SubmissionDto,
  SubmissionId,
  SubmissionRecord
} from '@bcr/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { importSubmissionFile } from './import-submission-file';
import { MessageSenderService } from '../network/message-sender.service';
import { IsAuthenticatedGuard } from '../user/is-authenticated.guard';
import { User } from '../utils/user.decorator';
import { UserRecord } from '../types/user.types';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { AbstractSubmissionService } from "./abstract-submission.service";

@ApiTags('submission')
@Controller('submission')
@UseGuards(IsAuthenticatedGuard)
export class SubmissionController {
  constructor(
    private submissionService: AbstractSubmissionService,
    private messageSenderService: MessageSenderService,
    private apiConfigService: ApiConfigService,
    private db: DbService
  ) {
  }

  @Get('payment-status/:submissionId')
  @ApiResponse({type: AmountSentBySenderDto})
  async getPaymentStatus(
    @Param('submissionId') submissionId: string
  ) {
    return await this.submissionService.getPaymentStatus(submissionId)
  }

  // @Get('verify-chain')
  // @ApiResponse({type: ChainStatus})
  // async verifyChain(): Promise<ChainStatus> {
  //
  //   const submissions = await this.db.submissions.find({}, {
  //     sort: {
  //       index: 1
  //     }
  //   });
  //
  //   let previousLink: SubmissionRecord;
  //   let brokenLink: SubmissionRecord;
  //   for (const submission of submissions) {
  //     if (previousLink) {
  //       if (submission.precedingHash !== previousLink.hash) {
  //         brokenLink = submission;
  //         break;
  //       }
  //     }
  //     previousLink = submission;
  //   }
  //
  //   return {
  //     isVerified: !brokenLink,
  //     brokenLinkVerificationId: brokenLink?._id
  //   };
  // }

  @Post()
  @ApiBody({type: CreateSubmissionDto})
  @ApiResponse({type: SubmissionDto})
  async createSubmission(
    @Body() submission: CreateSubmissionDto
  ): Promise<SubmissionDto> {
    const submissionId = await this.submissionService.createSubmission(submission);
    return await this.submissionService.getSubmissionDto(submissionId)
  }

  @Post('cancel')
  @ApiBody({type: SubmissionId})
  async cancelSubmission(
    @Body() body: SubmissionId
  ): Promise<void> {
    const submission = await this.db.submissions.get(body.id);
    if (submission.receiverAddress !== this.apiConfigService.nodeAddress) {
      throw new BadRequestException('Only the originating node can cancel a submission');
    }
    await this.submissionService.cancel(body.id);
    await this.messageSenderService.broadcastCancelSubmission(body.id);
  }

  @Get(':submissionId')
  @ApiResponse({type: SubmissionDto})
  async getSubmission(
    @Param('submissionId') submissionId: string
  ): Promise<SubmissionDto> {
    return await this.submissionService.getSubmissionDto(submissionId);
  }

  @Get()
  @ApiQuery({name: 'paymentAddress', required: true})
  @ApiResponse({type: SubmissionDto})
  async getSubmissionStatusByAddress(
    @Query('paymentAddress') paymentAddress: string
  ): Promise<SubmissionDto | null> {
    const submission = await this.db.submissions.findOne({paymentAddress}, {projection: {_id: 1}});
    if (!submission) {
      return null
    }
    return await this.submissionService.getSubmissionDto(submission._id);
  }

  @Post('submit-csv')
  @UseInterceptors(FileInterceptor('File'))
  @ApiResponse({type: SubmissionDto})
  @ApiBody({type: CreateSubmissionCsvDto})
  async submitCustomersHoldingsCsv(
    @User() user: UserRecord,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({maxSize: 10000}),
        new FileTypeValidator({fileType: 'csv'})
      ]
    })) file: Express.Multer.File,
    @Body() body: CreateSubmissionCsvDto
  ): Promise<SubmissionDto> {
    return await importSubmissionFile(
      file.buffer,
      this.submissionService,
      body.exchangeZpub,
      body.exchangeName,
      this.apiConfigService.nodeAddress
    );
  }


}
