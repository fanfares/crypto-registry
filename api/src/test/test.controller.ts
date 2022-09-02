import { Injectable, Post, Controller } from '@nestjs/common';
import { CustodianDbService } from '../custodian';
import { CustomerHoldingsDbService } from '../customer';

@Controller('test')
export class TestController {
  constructor(
    private custodianDbService: CustodianDbService,
    private customerHoldingsDbService: CustomerHoldingsDbService
  ) {
  }

  @Post('reset')
  async resetDb() {
    await this.custodianDbService.deleteMany({}, { type: 'anonymous'});
    await this.customerHoldingsDbService.deleteMany({}, { type: 'anonymous'})
    await this.custodianDbService.insert({
      publicKey: 'bc1qe7s4r5k7zx6en376a769e5fp0cml5znwmfgvq4',
      custodianName : "Test Exchange",
      totalCustomerHoldings : 10100,
      blockChainBalance : 1000000
    }, { type: 'anonymous'})
  }
}
