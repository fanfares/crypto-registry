import {
  Body,
  Controller,
  ForbiddenException,
  Get, Header,
  Param,
  Post, Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateHoldingsSubmissionDto, HoldingsSubmissionDto, SubmissionId, UserRecord } from '@bcr/types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { processHoldingsFile } from './process-holdings-file';
import { MultiFileValidationPipe } from '../utils';
import { HoldingsSubmissionService } from './holdings-submission.service';
import { IsAuthenticatedGuard, User } from '../auth';
import { DbService } from '../db/db.service';
import { holdingsSubmissionStatusRecordToDto } from './holdings-submission-record-to-dto';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('holdings-submission')
@Controller('holdings-submission')
@UseGuards(IsAuthenticatedGuard)
export class HoldingsSubmissionController {
  constructor(
    private holdingsSubmissionService: HoldingsSubmissionService,
    private db: DbService
  ) {
  }

  @Get('download-example-file')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="example-customer-balances.csv"')
  async downloadExampleFile(
    @Res() res: Response
  ) {
    const content = "email,amount,uid\n" +
      "59ae714e6670460d99e4787678539087fcec09f2440aca4b77eea63c23f64c8b,1000," + uuidv4() + "\n" +
      "bf2efeb3fe772c9e17f1a3f71d7e6914c174810bf2db1f6f0ca521a6d3ef3937,2000" + uuidv4();
    return res.send(content);
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
