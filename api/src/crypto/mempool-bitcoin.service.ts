import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BitcoinService, Transaction } from './bitcoin.service';
import mempoolJS from '@mempool/mempool.js';
import { AddressInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/addresses';
import { BlockInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/blocks';
import { DifficultyInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/difficulty';
import { FeeInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/fees';
import { MempoolInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/mempool';
import { TxInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/transactions';
import { WsInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/websockets';
import { Tx } from '@mempool/mempool.js/lib/interfaces';
import { ApiConfigService } from '../api-config';
import { plainToClass } from 'class-transformer';
import { Network } from '@bcr/types';

export interface MempoolJS {
  addresses: AddressInstance;
  blocks: BlockInstance;
  difficulty: DifficultyInstance;
  fees: FeeInstance;
  mempool: MempoolInstance;
  transactions: TxInstance;
  websocket: WsInstance;
}

@Injectable()
export class MempoolBitcoinService extends BitcoinService {

  constructor(
    private apiConfigService: ApiConfigService,
    private logger: Logger
  ) {
    super();
  }

  async getAddressBalance(
    address: string,
    network: Network
  ): Promise<number> {
    try {
      const utxo = await mempoolJS({ network }).bitcoin.addresses.getAddressTxsUtxo({ address });
      return utxo.reduce((total, next) => {
        return total + next.value;
      }, 0);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err.message);
    }
  }

  async getTransaction(txid: string, network: Network): Promise<Transaction> {
    try {
      const tx = await mempoolJS({ network }).bitcoin.transactions.getTx({ txid });
      return this.convertTransaction(tx);

    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  private convertTransaction(tx: Tx): Transaction {
    return plainToClass(Transaction, {
      txid: tx.txid,
      fee: tx.fee,
      blockTime: new Date(tx.status.block_time * 1000),
      inputValue: tx.vin.reduce((v, input) => v + input.prevout.value, 0),
      inputs: tx.vin.map(input => ({
        txid: input.txid,
        address: input.prevout.scriptpubkey_address,
        value: input.prevout.value
      })),
      outputs: tx.vout.map(output => ({
        value: output.value,
        address: output.scriptpubkey_address
      }))
    });
  }

  async getTransactionsForAddress(address: string, network: Network): Promise<Transaction[]> {
    try {
      const txs = await mempoolJS({ network }).bitcoin.addresses.getAddressTxs({ address });
      return txs.map(tx => this.convertTransaction(tx));
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
