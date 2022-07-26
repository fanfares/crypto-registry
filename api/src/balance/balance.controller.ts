import { Controller, Get, Param } from '@nestjs/common';
import axios from 'axios';

@Controller('balance')
export class BalanceController {

  @Get(':publicKey')
  async getBalance(
    @Param('publicKey') publicKey: string
  ): Promise<any> {
    const url = `https://blockchain.info/balance?active=${publicKey}`;
    try {
      const {data} = await axios.get(url);
      const result = data[publicKey];
      return {
        balance: result.final_balance
      };
    } catch (err) {
      return {
        error: err.message()
      };
    }
  }
}
