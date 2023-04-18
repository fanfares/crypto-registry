import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ExchangeDto } from '@bcr/types';
import { DbService } from '../db/db.service';

@ApiTags('exchange')
@Controller('exchange')
export class ExchangeController {

  constructor(
    private db: DbService) {
  }

  @Get()
  @ApiResponse({type: ExchangeDto, isArray: true})
  async getAllExchanges(): Promise<ExchangeDto[]> {
    const exchanges = await this.db.exchanges.find({});
    return exchanges.map((c) => ({
      _id: c._id,
      exchangeName: c.exchangeName,
      isRegistered: false
    }));
  }
}
