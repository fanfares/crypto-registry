import { Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExchangeDto } from '@bcr/types';
import { DbService } from '../db/db.service';
import { User } from '../utils/user.decorator';
import { UserDto, UserRecord } from '../types/user.types';
import { IsAuthenticatedGuard, IsSystemAdminGuard } from '../user';
import { ExchangeService } from './exchange.service';
import { IsExchangeUserGuard } from './is-exchange-user.guard';

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

  @Get('users')
  @UseGuards(IsExchangeUserGuard)
  @ApiResponse({type: UserDto, isArray: true})
  async getExchangeUsers(
    @User() user: UserRecord
  ): Promise<UserDto[]> {
    return await this.db.users.find({
      exchangeId: user.exchangeId
    });
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
