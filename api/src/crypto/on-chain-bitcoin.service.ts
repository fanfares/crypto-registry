import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { BitcoinService } from './bitcoin.service';

@Injectable()
export class OnChainBitcoinService extends BitcoinService {
  async getBalance(address: string): Promise<number> {
    const url = `https://blockchain.info/balance?active=${address}`;
    try {
      const { data } = await axios.get(url);
      const result = data[address];
      return result.final_balance;
    } catch (err) {
      throw new BadRequestException('Failed to read blockchain for address');
    }
  }
}
