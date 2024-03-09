import { getWalletBalance } from './get-wallet-balance';
import { Logger } from '@nestjs/common';
import { AmountSentBySender, BitcoinCoreBlock, Network, Transaction } from '@bcr/types';
import { Tx } from '@mempool/mempool.js/lib/interfaces';
import { plainToClass } from 'class-transformer';
import { Bip84Utils, isAddressFromWallet } from '../crypto';


export abstract class BitcoinService {
  protected constructor(
    public logger: Logger,
    protected network: Network,
    public name: string
  ) {
  }

  destroy() { // eslint-ignore-line
  }

  getAddress(zpub: string, index: number, change: boolean) {
    const account = Bip84Utils.fromExtendedKey(zpub);
    return account.getAddress(index, change);
  }

  protected convertTransaction(tx: Tx): Transaction {
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

  abstract getAddressBalance(address: string): Promise<number>;

  abstract getTransaction(txid: string): Promise<Transaction>;

  abstract getTransactionsForAddress(address: string): Promise<Transaction[]> ;

  async getWalletBalance(zpub: string): Promise<number> {
    this.logger.log(`get-wallet-balance: ${this.network} ${zpub} ${this.name}`);
    return await getWalletBalance(zpub, this);
  }

  async testService(): Promise<number> {
    try {
      this.logger.log('Service Test ' + this.name + ' on ' + this.network);
      const txs = await this.getTransactionsForAddress('tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul');
      this.logger.debug('Service Passed ' + this.name + ' on ' + this.network);
      return txs.length;
    } catch (err) {
      this.logger.error('Service Failed ' + this.name + ' on ' + this.network);
    }
  }

  abstract getLatestBlock(): Promise<string>;

  async getAmountSentBySender(
    address: string,
    searchZpub: string
  ): Promise<AmountSentBySender> {
    const transactionsForAddress: Transaction[] = await this.getTransactionsForAddress(address);

    if (transactionsForAddress.length === 0) {
      return {
        noTransactions: true,
        senderMismatch: false,
        valueOfOutputFromSender: 0
      };
    }

    interface TxOutput {
      address: string;
      value: number;
    }

    let outputValue: number | null = null;
    let senderMismatch = true;
    for (const tx of transactionsForAddress) {
      const changeOutput: TxOutput[] = tx.outputs
      .filter(o => o.address !== address)
      .filter(o => isAddressFromWallet(o.address, searchZpub));

      if (changeOutput.length > 0) {
        senderMismatch = false;
        const destOutputs: TxOutput[] = tx.outputs
        .filter(o => o.address === address);
        outputValue += destOutputs.reduce((t, o) => t + o.value, 0);
      }
    }

    return {
      valueOfOutputFromSender: outputValue,
      senderMismatch: senderMismatch,
      noTransactions: false
    };
  }

  async addressHasTransactions(address: string): Promise<boolean> {
    const txs = await this.getTransactionsForAddress(address);
    return txs.length > 0;
  }

  abstract getBlockDetails(
    blockHash: string,
    network: Network
  ): Promise<BitcoinCoreBlock>;
}
