import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateFundingSubmissionCsvDto,
  CreateFundingSubmissionDto,
  FundingSubmissionDto,
  SubmissionId
} from '@bcr/types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FundingSubmissionService } from './funding-submission.service';
import { processAddressFile } from './process-address-file';
import { MultiFileValidationPipe } from '../utils';
import { getSigningMessage } from '../crypto/get-signing-message';
import { UserRecord } from '../types/user.types';
import { IsAuthenticatedGuard, User } from '../user';
import { DbService } from '../db/db.service';
import { IsExchangeUserGuard } from '../exchange/is-exchange-user.guard';

@ApiTags('funding-submission')
@Controller('funding-submission')
@UseGuards(IsAuthenticatedGuard)
export class FundingSubmissionController {
  constructor(
    private fundingSubmissionService: FundingSubmissionService,
    private db: DbService
  ) {
  }

  @Get()
  @ApiResponse({type: FundingSubmissionDto, isArray: true})
  async getSubmissions(
    @User() user: UserRecord
  ) {
    return this.db.fundingSubmissions.find({
      exchangeId: user.exchangeId
    }, {
      sort: {
        createdDate: -1
      },
      limit: 20
    });
  }

  @Post()
  @ApiBody({type: CreateFundingSubmissionDto})
  @UseGuards(IsExchangeUserGuard)
  @ApiResponse({type: FundingSubmissionDto})
  async createSubmission(
    @Body() submission: CreateFundingSubmissionDto,
    @User() user: UserRecord
  ): Promise<FundingSubmissionDto> {
    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
    const submissionId = await this.fundingSubmissionService.createSubmission(user.exchangeId, submission.addresses, submission.signingMessage);
    return await this.fundingSubmissionService.getSubmissionDto(submissionId);
  }

  @Post('cancel')
  @ApiBody({type: SubmissionId})
  async cancelSubmission(
    @Body() body: SubmissionId
  ): Promise<void> {
    await this.fundingSubmissionService.cancel(body.id);
  }

  @Get('signing-message')
  getSigningMessage() {
    return getSigningMessage();
  }

  @Get(':submissionId')
  @ApiResponse({type: FundingSubmissionDto})
  async getSubmission(
    @Param('submissionId') submissionId: string,
    @User() user: UserRecord
  ): Promise<FundingSubmissionDto> {
    const submission = await this.db.fundingSubmissions.get(submissionId);
    if (submission.exchangeId !== user.exchangeId) {
      throw new ForbiddenException();
    }
    return await this.fundingSubmissionService.getSubmissionDto(submissionId);
  }

  @Post('submit-csv')
  @UseInterceptors(
    FileFieldsInterceptor([{
      name: 'addressFile', maxCount: 1
    }]))
  @ApiResponse({type: FundingSubmissionDto})
  @ApiBody({type: CreateFundingSubmissionCsvDto})
  async submitCsv(
    @UploadedFiles(new MultiFileValidationPipe()) files: { [fieldname: string]: Express.Multer.File },
    @Body() body: CreateFundingSubmissionCsvDto,
    @User() user: UserRecord
  ): Promise<FundingSubmissionDto> {
    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
    const addresses = await processAddressFile(files.addressFile[0].buffer);
    const submissionId = await this.fundingSubmissionService.createSubmission(
      user.exchangeId, addresses, body.signingMessage
    );
    return await this.fundingSubmissionService.getSubmissionDto(submissionId);
  }
}
