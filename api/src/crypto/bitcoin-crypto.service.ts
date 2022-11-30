import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { RawAddr } from './bitcoin-info.types';
import { CryptoService } from './crypto.service';

@Injectable()
export class BitcoinCryptoService extends CryptoService {
  async getBalance(publicKey: string): Promise<number> {
    const url = `https://blockchain.info/balance?active=${publicKey}`;
    try {
      const { data } = await axios.get(url);
      const result = data[publicKey];
      return result.final_balance;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getTransaction(fromKey: string, toKey: string): Promise<number> {
    const url = `https://blockchain.info/rawaddr/${fromKey}`;
    let totalTransacted = 0;
    try {
      const { data } = await axios.get(url);
      const rawAddr = data as RawAddr;
      for (const tx of rawAddr.txs) {
        for (const input of tx.inputs) {
          if (input.prev_out.addr === toKey) {
            totalTransacted += input.prev_out.value;
          }
        }
      }
      return totalTransacted;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
