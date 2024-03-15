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
  CreateFundingAddressDto,
  CreateFundingSubmissionCsvDto,
  CreateFundingSubmissionDto,
  FundingSubmissionStatusDto,
  FundingSubmissionDto,
  UserRecord
} from '@bcr/types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FundingSubmissionService } from './funding-submission.service';
import { processAddressFile } from './process-address-file';
import { MultiFileValidationPipe } from '../utils';
import { User } from '../auth';
import { DbService } from '../db/db.service';
import { IsExchangeUserGuard } from '../exchange/is-exchange-user.guard';
import { Response } from 'express';
import { FundingAddressStatus } from '../types/funding-address.type';

@ApiTags('funding-submission')
@Controller('funding-submission')
@UseGuards(IsExchangeUserGuard)
export class FundingSubmissionController {
  constructor(
    private fundingSubmissionService: FundingSubmissionService,
    private db: DbService
  ) {
  }

  @Get('status')
  @UseGuards(IsExchangeUserGuard)
  @ApiResponse({type: FundingSubmissionStatusDto})
  async getFundingStatus(
    @User() user: UserRecord
  ): Promise<FundingSubmissionStatusDto> {
    const numberOfPendingAddresses = await this.db.fundingAddresses.count({
      exchangeId: user.exchangeId,
      status: FundingAddressStatus.PENDING
    });

    const numberOfActiveAddresses = await this.db.fundingAddresses.count({
      exchangeId: user.exchangeId,
      status: FundingAddressStatus.ACTIVE
    });

    const numberOfFailedAddresses = await this.db.fundingAddresses.count({
      exchangeId: user.exchangeId,
      status: FundingAddressStatus.FAILED
    });

    return {
      numberOfPendingAddresses, numberOfActiveAddresses, numberOfFailedAddresses
    };
  }

  @Get('download-example-file')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="example-on-chain-funding.csv"')
  async downloadExampleFile(
    @Res() res: Response
  ) {
    const headers = 'address,signature';
    const row = '000000000000001496a753c7140b900c525c13549f918588ae729b626b07823b,bc1qn3d7vyks0k3fx38xkxazpep8830ttmydwekrnl,HyKM49FjTpHvNIEbNVPQyiy7Tp8atdS8xHXM99khz3mmNrwL99TeCntP2MbepxWErS4a37IM2dy+886aOZ9GpFM=';
    return res.send(`${headers}\n${row}`);
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
    const submissionId = await this.fundingSubmissionService.createSubmission(user.exchangeId, submission);
    return await this.fundingSubmissionService.getSubmissionDto(submissionId);
  }

  @Post('cancel-pending')
  @UseGuards(IsExchangeUserGuard)
  async cancelPending(
    @User() user: UserRecord
  ): Promise<FundingSubmissionStatusDto> {
    await this.fundingSubmissionService.cancelPending(user.exchangeId);
    return this.getFundingStatus(user);
  }

  @Get(':submissionId')
  @ApiResponse({type: FundingSubmissionDto})
  async getSubmission(
    @Param('submissionId') submissionId: string,
    @User() user: UserRecord
  ): Promise<FundingSubmissionDto> {
    const submission = await this.db.fundingSubmissions.get(submissionId);
    if (!submission) {
      return null;
    }
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
  @ApiResponse({type: FundingSubmissionStatusDto})
  @ApiBody({type: CreateFundingSubmissionCsvDto})
  async submitCsv(
    @UploadedFiles(new MultiFileValidationPipe()) files: { [fieldname: string]: Express.Multer.File },
    @Body() body: CreateFundingSubmissionCsvDto,
    @User() user: UserRecord
  ): Promise<FundingSubmissionStatusDto> {
    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
    let addresses: CreateFundingAddressDto[];

    try {
      addresses = await processAddressFile(files.addressFile[0].buffer);
    } catch (err) {
      throw new BadRequestException(err);
    }

    const submissionId = await this.fundingSubmissionService.createSubmission(
      user.exchangeId, {addresses, resetFunding: body.resetFunding}
    );

    return await this.getFundingStatus(user);
  }
}
