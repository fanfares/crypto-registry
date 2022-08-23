import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { ApiConfigService } from '../api-config/api-config.service';
import { RawAddr } from './block-chain.types';

@Injectable()
export class BlockChainService {

  constructor(
    private configService: ApiConfigService
  ) {
  }

  async getCurrentBalance(
    publicKey: string
  ): Promise<number> {
    const url = `https://blockchain.info/balance?active=${publicKey}`;
    try {
      const {data} = await axios.get(url);
      const result = data[publicKey];
      return result.final_balance;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async isPaymentMade(
    custodianPublicKey: string,
    amount: number // todo - implement amount check.
  ): Promise<boolean> {
    const url = `https://blockchain.info/rawaddr/${this.configService.registryPublicKey}`;
    try {
      const {data} = await axios.get(url);
      const rawAddr = data as RawAddr;
      for (const tx of rawAddr.txs.filter(t => t.hash === 'ff5dcd2edfb8ef7451e75a17a2e378ab5466078e695c583c412953fb8f13300d')) {
        for (const input of tx.inputs) {
          if ( input.prev_out.addr === custodianPublicKey) {
            return true;
          }
        }
      }
      return false;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

}
