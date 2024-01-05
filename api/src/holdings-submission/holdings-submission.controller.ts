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
  CreateHoldingsSubmissionDto,
  HoldingsSubmissionDto,
  SubmissionId
} from '@bcr/types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { processHoldingsFile } from './process-holdings-file';
import { MultiFileValidationPipe } from '../utils';
import { HoldingsSubmissionService } from './holdings-submission.service';
import { IsAuthenticatedGuard, User } from '../user';
import { UserRecord } from '../types/user.types';
import { DbService } from '../db/db.service';
import { holdingsSubmissionStatusRecordToDto } from './holdings-submission-record-to-dto';

@ApiTags('holdings-submission')
@Controller('holdings-submission')
@UseGuards(IsAuthenticatedGuard)
export class HoldingsSubmissionController {
  constructor(
    private holdingsSubmissionService: HoldingsSubmissionService,
    private db: DbService
  ) {
  }

  @Get()
  @ApiResponse({type: HoldingsSubmissionDto, isArray: true})
  async getSubmissions(
    @User() user: UserRecord
  ) {
    return this.db.holdingsSubmissions.find({
      exchangeId: user.exchangeId
    }, {
      sort: {
        createdDate: -1
      },
      limit: 20
    });
  }

  @Post()
  @ApiBody({type: CreateHoldingsSubmissionDto})
  @ApiResponse({type: HoldingsSubmissionDto})
  async createSubmission(
    @Body() submission: CreateHoldingsSubmissionDto,
    @User() user: UserRecord
  ): Promise<HoldingsSubmissionDto> {
    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
    const submissionId = await this.holdingsSubmissionService.createSubmission(user.exchangeId, submission.holdings);
    return await this.holdingsSubmissionService.getSubmissionDto(submissionId);
  }

  @Post('cancel')
  @ApiBody({type: SubmissionId})
  async cancelSubmission(
    @Body() body: SubmissionId,
    @User() user: UserRecord
  ): Promise<void> {
    const holding = await this.db.holdingsSubmissions.get(body.id);
    if (holding.exchangeId !== user.exchangeId) {
      throw new ForbiddenException();
    }
    await this.holdingsSubmissionService.cancel(body.id);
  }

  @Get('current')
  @ApiResponse({type: HoldingsSubmissionDto})
  async getCurrentSubmission(
    @User() user: UserRecord
  ): Promise<HoldingsSubmissionDto> {
    const currentSubmission = await this.db.holdingsSubmissions.findOne({
      isCurrent: true,
      exchangeId: user.exchangeId
    });
    return holdingsSubmissionStatusRecordToDto(currentSubmission, []);
  }

  @Get(':submissionId')
  @ApiResponse({type: HoldingsSubmissionDto})
  async getSubmission(
    @Param('submissionId') submissionId: string
  ): Promise<HoldingsSubmissionDto> {
    return await this.holdingsSubmissionService.getSubmissionDto(submissionId);
  }

  @Post('submit-csv')
  @UseInterceptors(
    FileFieldsInterceptor([{
      name: 'holdingsFile', maxCount: 1
    }]))
  @ApiResponse({type: HoldingsSubmissionDto})
  async submitCustomersHoldingsCsv(
    @UploadedFiles(new MultiFileValidationPipe()) files: { [fieldname: string]: Express.Multer.File },
    @User() user: UserRecord
  ): Promise<HoldingsSubmissionDto> {
    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
    const holdings = await processHoldingsFile(files.holdingsFile[0].buffer);
    const submissionId = await this.holdingsSubmissionService.createSubmission(user.exchangeId, holdings);
    return await this.holdingsSubmissionService.getSubmissionDto(submissionId);
  }
}
