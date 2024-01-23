import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  Param,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateFundingSubmissionCsvDto,
  CreateFundingSubmissionDto,
  CreateRegisteredAddressDto,
  FundingSubmissionDto,
  SubmissionId,
  UserRecord
} from '@bcr/types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FundingSubmissionService } from './funding-submission.service';
import { processAddressFile } from './process-address-file';
import { MultiFileValidationPipe } from '../utils';
import { getSigningMessage } from '../crypto/get-signing-message';
import { IsAuthenticatedGuard, User } from '../auth';
import { DbService } from '../db/db.service';
import { IsExchangeUserGuard } from '../exchange/is-exchange-user.guard';
import { Response } from 'express';

@ApiTags('funding-submission')
@Controller('funding-submission')
@UseGuards(IsAuthenticatedGuard)
export class FundingSubmissionController {
  constructor(
    private fundingSubmissionService: FundingSubmissionService,
    private db: DbService
  ) {
  }

  @Get('download-example-file')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="example-funding-submission.csv"')
  async downloadExampleFile(
    @Res() res: Response
  ) {
    const content = 'address,signature\nbc1qn3d7vyks0k3fx38xkxazpep8830ttmydwekrnl,HyKM49FjTpHvNIEbNVPQyiy7Tp8atdS8xHXM99khz3mmNrwL99TeCntP2MbepxWErS4a37IM2dy+886aOZ9GpFM=';
    return res.send(content);
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
    const submissionId = await this.fundingSubmissionService.createSubmission(user.exchangeId, submission.addresses, submission.signingMessage);
    return await this.fundingSubmissionService.getSubmissionDto(submissionId);
  }

  @Post('cancel')
  @ApiBody({type: SubmissionId})
  @UseGuards(IsExchangeUserGuard)
  async cancelSubmission(
    @Body() body: SubmissionId
  ): Promise<FundingSubmissionDto> {
    await this.fundingSubmissionService.cancel(body.id);
    return await this.fundingSubmissionService.getSubmissionDto(body.id);
  }

  @Get('signing-message')
  getSigningMessage() {
    return getSigningMessage();
  }

  @Get('current')
  @UseGuards(IsExchangeUserGuard)
  @ApiResponse({type: FundingSubmissionDto})
  async getCurrentSubmission(
    @User() user: UserRecord
  ): Promise<FundingSubmissionDto> {
    return await this.db.fundingSubmissions.findOne({
      exchangeId: user.exchangeId,
      isCurrent: true
    });
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
    let addresses: CreateRegisteredAddressDto[];

    try {
      addresses = await processAddressFile(files.addressFile[0].buffer);
    } catch (err) {
      throw new BadRequestException(err);
    }

    const submissionId = await this.fundingSubmissionService.createSubmission(
      user.exchangeId, addresses, body.signingMessage
    );
    return await this.fundingSubmissionService.getSubmissionDto(submissionId);
  }

}
