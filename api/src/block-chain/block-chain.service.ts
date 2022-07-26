import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BlockChainService {

  async getCurrentBalance(publicKey: string) {
    const url = `https://blockchain.info/balance?active=${publicKey}`;
    try {
      const {data} = await axios.get(url);
      const result = data[publicKey];
      return {
        balance: result.final_balance
      };
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

}
