import { Post, Controller, Get } from '@nestjs/common';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer';
import { ApiConfigService } from '../api-config/api-config.service';

@Controller('test')
export class TestController {
  constructor(
    private exchangeDbService: ExchangeDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService,
    private apiConfigService: ApiConfigService
  ) {}

  @Get('reset')
  async resetDb() {
    await this.exchangeDbService.deleteMany({}, { type: 'anonymous' });
    await this.customerHoldingsDbService.deleteMany({}, { type: 'anonymous' });
    const exchangeId = await this.exchangeDbService.insert(
      {
        publicKey: this.apiConfigService.registryKey,
        custodianName: 'Test Exchange',
        totalCustomerHoldings: 100,
        blockChainBalance: 100,
      },
      { type: 'anonymous' },
    );

    await this.customerHoldingsDbService.insert({
      amount: 100,
      exchangeId: exchangeId,
      hashedEmail: 'rob@excal.tv',
    }, {type: 'reset'})

    return {
      status: 'ok'
    }
  }
}
