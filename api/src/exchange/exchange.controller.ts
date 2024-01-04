import { Controller, ForbiddenException, Get, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExchangeDto } from '@bcr/types';
import { DbService } from '../db/db.service';
import { IsExchangeUserGuard } from './is-exchange-user.guard';
import { User } from '../utils/user.decorator';
import { UserRecord } from '../types/user.types';
import { IsSystemAdminGuard } from '../user/is-system-admin.guard';
import { IsAuthenticatedGuard } from '../user';

@ApiTags('exchange')
@Controller('exchange')
@UseGuards(IsAuthenticatedGuard)
export class ExchangeController {

  constructor(
    private db: DbService
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
    if ( !user.exchangeId ) {
      throw new ForbiddenException()
    }
    return await this.db.exchanges.get(user.exchangeId);
  }

}
