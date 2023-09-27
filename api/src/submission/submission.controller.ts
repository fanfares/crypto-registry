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
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubmissionCsvDto, CreateSubmissionDto, SubmissionDto, SubmissionId } from '@bcr/types';
import { FileInterceptor } from '@nestjs/platform-express';
import { importSubmissionFile } from './import-submission-file';
import { IsAuthenticatedGuard } from '../user/is-authenticated.guard';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { AbstractSubmissionService } from './abstract-submission.service';

@ApiTags('submission')
@Controller('submission')
@UseGuards(IsAuthenticatedGuard)
export class SubmissionController {
  constructor(
    private submissionService: AbstractSubmissionService,
    private apiConfigService: ApiConfigService,
    private db: DbService
  ) {
  }

  @Post()
  @ApiBody({type: CreateSubmissionDto})
  @ApiResponse({type: SubmissionDto})
  async createSubmission(
    @Body() submission: CreateSubmissionDto
  ): Promise<SubmissionDto> {
    const submissionId = await this.submissionService.createSubmission(submission);
    return await this.submissionService.getSubmissionDto(submissionId);
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
  }

  @Get(':submissionId')
  @ApiResponse({type: SubmissionDto})
  async getSubmission(
    @Param('submissionId') submissionId: string
  ): Promise<SubmissionDto> {
    return await this.submissionService.getSubmissionDto(submissionId);
  }

  @Post('submit-csv')
  @UseInterceptors(FileInterceptor('File'))
  @ApiResponse({type: SubmissionDto})
  @ApiBody({type: CreateSubmissionCsvDto})
  async submitCustomersHoldingsCsv(
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
      body.exchangeZpubs,
      body.exchangeName,
      this.apiConfigService.nodeAddress,
      body.network
    );
  }


}
