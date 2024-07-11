import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateExchangeDto, ExchangeDto, UpdateExchangeDto, UserRecord } from '@bcr/types';
import { DbService } from '../db/db.service';
import { IsSystemAdminGuard, User } from '../auth';
import { ExchangeService } from './exchange.service';
import { IsExchangeUserGuard } from './is-exchange-user.guard';

@ApiTags('exchange')
@Controller('exchange')
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
  @UseGuards(IsExchangeUserGuard)
  async getUserExchange(
    @User() user: UserRecord
  ): Promise<ExchangeDto> {
    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
    return await this.db.exchanges.get(user.exchangeId);
  }

  @Post()
  @UseGuards(IsSystemAdminGuard)
  @ApiResponse({type: ExchangeDto})
  async createExchange(
    @Body() body: CreateExchangeDto
  ) {
    return await this.exchangeService.createExchange(body.name);
  }

  @Patch(':id')
  @UseGuards(IsSystemAdminGuard)
  async updateExchange(
    @User() user: UserRecord,
    @Param('id') exchangeId: string,
    @Body() body: UpdateExchangeDto
  ) {
    await this.exchangeService.updateExchange(exchangeId, body.name);
  }

}
