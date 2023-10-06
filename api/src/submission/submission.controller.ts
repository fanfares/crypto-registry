import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateSubmissionCsvDto, CreateSubmissionDto, SubmissionDto, SubmissionId } from '@bcr/types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IsAuthenticatedGuard } from '../user/is-authenticated.guard';
import { ApiConfigService } from '../api-config';
import { DbService } from '../db/db.service';
import { AbstractSubmissionService } from './abstract-submission.service';
import { processHoldingsFile } from './process-holdings-file';
import { processAddressFile } from './process-address-file';
import { MultiFileValidationPipe } from './multi-file-validation-pipe';

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

  @Get('signing-message')
  getSigningMessage() {
    return 'I promise that I own these bitcoin adddresses';
  }

  @Get(':submissionId')
  @ApiResponse({type: SubmissionDto})
  async getSubmission(
    @Param('submissionId') submissionId: string
  ): Promise<SubmissionDto> {
    return await this.submissionService.getSubmissionDto(submissionId);
  }

  @Post('submit-csv')
  @UseInterceptors(
    FileFieldsInterceptor([{
      name: 'holdingsFile', maxCount: 1
    }, {
      name: 'addressFile', maxCount: 1
    }]))
  @ApiResponse({type: SubmissionDto})
  @ApiBody({type: CreateSubmissionCsvDto})
  async submitCustomersHoldingsCsv(
    @UploadedFiles(new MultiFileValidationPipe()) files: { [fieldname: string]: Express.Multer.File },
    @Body() body: CreateSubmissionCsvDto
  ): Promise<SubmissionDto> {
    const holdings = await processHoldingsFile(files.holdingsFile[0].buffer);
    const addresses = await processAddressFile(files.addressFile[0].buffer, this.getSigningMessage());

    const submissionId = await this.submissionService.createSubmission({
      exchangeName: body.exchangeName,
      network: body.network,
      receiverAddress: this.apiConfigService.nodeAddress,
      customerHoldings: holdings,
      wallets: addresses,
      signingMessage: this.getSigningMessage()
    });

    return await this.submissionService.getSubmissionDto(submissionId);
  }


}
