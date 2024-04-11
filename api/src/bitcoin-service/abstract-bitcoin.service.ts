import { Logger } from '@nestjs/common';
import { AmountSentBySender, BitcoinCoreBlock, Network, Transaction } from '@bcr/types';
import { Tx } from '@mempool/mempool.js/lib/interfaces';
import { plainToClass } from 'class-transformer';
import { Bip84Utils, isAddressFromWallet } from '../crypto';
import { BitcoinService } from './bitcoin.service';


export abstract class AbstractBitcoinService implements BitcoinService {

  protected constructor(
    protected logger: Logger,
    protected network: Network,
    protected name: string,
  ) {
  }

  disconnect() {
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

  // eslint-disable-next-line
  async getAddressBalances(addresses: string[]): Promise<Map<string, number>> {
    throw new Error('Not implemented')
  };

  abstract getTransaction(txid: string): Promise<Transaction>;

  abstract getTransactionsForAddress(address: string): Promise<Transaction[]> ;

  async getWalletBalance(zpub: string): Promise<number> {
    this.logger.log(`get-wallet-balance: ${this.network} ${zpub} ${this.name}`);
    const account = Bip84Utils.fromExtendedKey(zpub);
    const receivedBalance = await this.getAddressSeriesBalance(account, false);
    const changeBalance = await this.getAddressSeriesBalance(account, true);
    return receivedBalance + changeBalance;
  }

  async testService(): Promise<number> {
    try {
      const testnetAddress = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
      const mainnetAddress = 'bc1q2chuel428jyyw25q83jhl7gs37zrpf7jdtghy8';
      const address  = this.network === Network.testnet ? testnetAddress: mainnetAddress
      this.logger.log( this.name + 'service test: ' + this.network + ' ' + address );
      const balance = await this.getAddressBalance(address);
      this.logger.debug(this.name + ' bitcoin service ok (' + this.network + ')');
      return balance;
    } catch (err) {
      this.logger.error(this.name + ' bitcoin service failed ' + err.message ?? err.toString() );
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


  private getAddressSeriesBalance = async (
    bip84Utils:  Bip84Utils,
    change: boolean
  ) => {
    let balance = 0;
    let zeroTxAddresses = 0;
    const maxEmpty = change ? 10 : 20;
    for (let i = 0; zeroTxAddresses < maxEmpty; i++) {
      const address = bip84Utils.getAddress(i, change);
      const addressBalance = await this.getAddressBalance(address);
      // bitcoinService.logger.log('Next Address', {i, change, address, addressBalance, zeroTxAddresses, balance})
      balance += addressBalance;
      const hasTx = await this.addressHasTransactions(address);

      if (hasTx) {
        zeroTxAddresses = 0;
      } else {
        zeroTxAddresses++;
      }
    }
    return balance;
  };

}
