import { Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExchangeDto, UserRecord } from '@bcr/types';
import { DbService } from '../db/db.service';
import { User } from '../utils';
import { IsAuthenticatedGuard, IsSystemAdminGuard } from '../auth';
import { ExchangeService } from './exchange.service';

@ApiTags('exchange')
@Controller('exchange')
@UseGuards(IsAuthenticatedGuard)
export class ExchangeController {

  constructor(
    private db: DbService,
    private exchangeService: ExchangeService
  ) {
  }

  @Get('all')
  @UseGuards(IsSystemAdminGuard)
  @ApiResponse({type: ExchangeDto, isArray: true})
  async getAllExchanges(): Promise<ExchangeDto[]> {
    return await this.db.exchanges.find({});
  }

  @Get()
  @ApiResponse({type: ExchangeDto})
  async getUserExchange(
    @User() user: UserRecord
  ): Promise<ExchangeDto> {
    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
    return await this.db.exchanges.get(user.exchangeId);
  }

  @Post('update-status')
  async updateStatus(
    @User() user: UserRecord
  ) {
    await this.exchangeService.updateStatus(user.exchangeId);
  }

}
