import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BlockChainService {

  async getCurrentBalance(
    publicKey: string
  ): Promise<number> {
    const url = `https://blockchain.info/balance?active=${publicKey}`;
    try {
      const {data} = await axios.get(url);
      const result = data[publicKey];
      return result.final_balance
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

}
