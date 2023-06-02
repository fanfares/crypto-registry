import { BadRequestException, Logger } from '@nestjs/common';
import { BitcoinService, OutputAddress, Transaction } from './bitcoin.service';
import { Network } from '@bcr/types';
import axios from 'axios';

export class BlockstreamBitcoinService extends BitcoinService {

  private get url() {
    return `https://blockstream.info${this.network === Network.testnet ? '/' + this.network : ''}/api`;
  }

  constructor(
    network: Network,
    logger: Logger
  ) {
    super(logger, network);
  }

  async getAddressBalance(address: string): Promise<number> {
    try {
      const url = `${this.url}/address/${address}/utxo`;
      await process.nextTick(() => { // eslint-disable-line
      });
      const {data} = await axios.get(url);
      return data.reduce((total, next) => {
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
      const url = `${this.url}/tx/${txid}`;
      await process.nextTick(() => { // eslint-disable-line
      });
      const {data} = await axios.get(url);
      return this.convertTransaction(data);

    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> {
    try {
      const url = `${this.url}/address/${address}/txs`;
      await process.nextTick(() => { // eslint-disable-line
      });
      const {data} = await axios.get(url);
      return data.map(tx => this.convertTransaction(tx));
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getLatestBlock(): Promise<string> {
    try {
      const url = `${this.url}/blocks/tip/hash`;
      const {data} = await axios.get(url);
      return data;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async getUrl(uri: string): Promise<string> {
    try {
      let cleanUri = uri
      if (uri.startsWith('/')) {
        cleanUri = uri.substring(1, uri.length)
      }
      const url = `${this.url}/${cleanUri}`;
      const {data} = await axios.get(url);
      return data;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  addressHasTransactions(address: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getPreviousOutputAddress(address: string): Promise<OutputAddress[]> {
    throw new Error('Method not implemented.');
  }

}
