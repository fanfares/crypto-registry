import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { ExchangeDto } from '@bcr/types';
import { ExchangeDbService } from './exchange.db.service';

@ApiTags('exchange')
@Controller('exchange')
export class ExchangeController {

  constructor(
    private exchangeDbService: ExchangeDbService) {
  }

  @Get()
  @ApiResponse({ type: ExchangeDto, isArray: true })
  async getAllExchanges(): Promise<ExchangeDto[]> {
    const exchanges = await this.exchangeDbService.find({});
    return exchanges.map((c) => ({
      _id: c._id,
      exchangeName: c.exchangeName,
      isRegistered: false
    }));
  }
}
