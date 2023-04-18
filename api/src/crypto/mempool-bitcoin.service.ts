import { BadRequestException, Logger } from '@nestjs/common';
import { BitcoinService, Transaction } from './bitcoin.service';
import mempoolJS from '@mempool/mempool.js';
import { AddressInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/addresses';
import { BlockInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/blocks';
import { DifficultyInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/difficulty';
import { FeeInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/fees';
import { MempoolInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/mempool';
import { TxInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/transactions';
import { WsInstance } from '@mempool/mempool.js/lib/interfaces/bitcoin/websockets';
import { Network } from '@bcr/types';
import { getWalletBalance } from './get-wallet-balance';

export class MempoolBitcoinService extends BitcoinService {

  bitcoin: {
    addresses: AddressInstance;
    blocks: BlockInstance;
    difficulty: DifficultyInstance;
    fees: FeeInstance;
    mempool: MempoolInstance;
    transactions: TxInstance;
    websocket: WsInstance;
  };

  constructor(
    network: Network,
    logger: Logger
  ) {
    super(logger, network);
    const {bitcoin} = mempoolJS({network});
    this.bitcoin = bitcoin;
  }

  async getAddressBalance(address: string): Promise<number> {
    try {
      await process.nextTick(() => {  // eslint-disable-line
      });
      const utxo = await this.bitcoin.addresses.getAddressTxsUtxo({address});
      return utxo.reduce((total, next) => {
        return total + next.value;
      }, 0);
    } catch (err) {
      this.logger.error(err);
      if (err.status === 429) {
        throw new BadRequestException('Too many requests to Bitcoin network');
      }
      let message = err.message;
      if (err.response && err.response.data) {
        message = err.response.data;
      }
      throw new BadRequestException(message);
    }
  }

  async getTransaction(txid: string): Promise<Transaction> {
    try {
      await process.nextTick(() => { // eslint-disable-line
      });
      const tx = await this.bitcoin.transactions.getTx({txid});
      return this.convertTransaction(tx);

    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> {
    try {
      await process.nextTick(() => {  // eslint-disable-line
      });
      const txs = await this.bitcoin.addresses.getAddressTxs({address});
      return txs.map(tx => this.convertTransaction(tx));
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getWalletBalance(zpub: string): Promise<number> {
    return await getWalletBalance(zpub, this, 2000);
  }

  async getLatestBlock(): Promise<string> {
    return await this.bitcoin.blocks.getBlocksTipHash()
  }

}
