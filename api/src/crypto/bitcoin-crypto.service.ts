import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CryptoService } from './crypto.service';
import { Transaction } from '../types/transaction.type';
import { BitcoinInfoRawAddr } from './bitcoin-info.types';
import { Coin } from '../types/coin.type';

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

  async getTransactions(fromKey: string, toKey: string): Promise<Transaction[]> {
    const url = `https://blockchain.info/rawaddr/${fromKey}`;
    try {
      const { data } = await axios.get<BitcoinInfoRawAddr>(url);
      const txs: Transaction[] = []
      for (const items of data.txs) {
        for (const input of items.inputs) {
          if (input.prev_out.addr === toKey) {
            txs.push({
              fromKey: input.prev_out.addr,
              toKey: toKey,
              coin: Coin.bitcoin,
              amount: input.prev_out.value
            })
          }
        }
      }
      return txs;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
