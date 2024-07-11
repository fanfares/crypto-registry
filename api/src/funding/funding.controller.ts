import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  MessageEvent,
  Post,
  Res,
  Sse,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateFundingAddressDto,
  CreateFundingSubmissionCsvDto,
  CreateFundingSubmissionDto,
  FundingStatusDto,
  RefreshBalancesRequestDto,
  UserRecord
} from '@bcr/types';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { FundingService } from './funding.service';
import { processAddressFile } from './process-address-file';
import { MultiFileValidationPipe } from '../utils';
import { User } from '../auth';
import { DbService } from '../db/db.service';
import { IsExchangeUserGuard } from '../exchange/is-exchange-user.guard';
import { Response } from 'express';
import { FundingAddressStatus } from '../types/funding-address.type';
import { interval, map, Observable, take } from 'rxjs';

@ApiTags('funding-submission')
@Controller('funding-submission')
export class FundingController {
  constructor(
    private fundingService: FundingService,
    private db: DbService
  ) {
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(2000)
    .pipe(
      take(10),
      map((counter) => ({
        data: {time: counter}
      })));
  }

  @Get('status')
  @UseGuards(IsExchangeUserGuard)
  @ApiResponse({type: FundingStatusDto})
  async getFundingStatus(
    @User() user: UserRecord
  ): Promise<FundingStatusDto> {
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

  @Post()
  @ApiBody({type: CreateFundingSubmissionDto})
  @UseGuards(IsExchangeUserGuard)
  async createSubmission(
    @Body() submission: CreateFundingSubmissionDto,
    @User() user: UserRecord
  ): Promise<void> {
    await this.fundingService.createSubmission(user.exchangeId, submission);
  }

  @Post('cancel-pending')
  @UseGuards(IsExchangeUserGuard)
  async cancelPending(
    @User() user: UserRecord
  ): Promise<FundingStatusDto> {
    await this.fundingService.cancelPending(user.exchangeId);
    return this.getFundingStatus(user);
  }

  @Post('submit-csv')
  @UseInterceptors(
    FileFieldsInterceptor([{
      name: 'addressFile', maxCount: 1
    }]))
  @ApiResponse({type: FundingStatusDto})
  @ApiBody({type: CreateFundingSubmissionCsvDto})
  async submitCsv(
    @UploadedFiles(new MultiFileValidationPipe()) files: { [fieldname: string]: Express.Multer.File },
    @Body() body: CreateFundingSubmissionCsvDto,
    @User() user: UserRecord
  ): Promise<FundingStatusDto> {
    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
    let addresses: CreateFundingAddressDto[];

    try {
      addresses = await processAddressFile(files.addressFile[0].buffer);
    } catch (err) {
      throw new BadRequestException(err);
    }

    await this.fundingService.createSubmission(
      user.exchangeId, {addresses, resetFunding: body.resetFunding}
    );

    return await this.getFundingStatus(user);
  }

  @Post('refresh-balances')
  @UseGuards(IsExchangeUserGuard)
  async refreshBalances(
    @User() user: UserRecord,
    @Body() request: RefreshBalancesRequestDto
  ): Promise<void> {
    if (!user.isSystemAdmin) {
      if (user.exchangeId !== request.exchangeId) {
        throw new ForbiddenException();
      }
    }
    await this.fundingService.refreshExchangeBalances(request.exchangeId);
  }

}
