import { Logger } from "@nestjs/common";
import { BitcoinCoreBlock, Network, Transaction } from '@bcr/types';
import { ElectrumClient } from './electrum-client';
import { addressToScriptHash } from './address-to-script-hash';
import { ApiConfigService } from '../api-config';
import { satoshiInBitcoin } from '../utils';
import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';
import { AbstractBitcoinService } from '../bitcoin-service/abstract-bitcoin.service';

interface ElectrumTxForAddress {
  tx_hash: string;
  height: number;
}

export class ElectrumService extends AbstractBitcoinService {
  private client: ElectrumClient;
  private bitcoinCoreService: BitcoinCoreApiFactory

  constructor(
    network: Network,
    logger: Logger,
    config: ApiConfigService
  ) {
    super(logger, network, 'electrum');
    const url = network === Network.testnet ? config.electrumTestnetUrl : config.electrumMainnetUrl
    this.client = new ElectrumClient(url, logger)
    this.bitcoinCoreService = new BitcoinCoreApiFactory(config);
  }

  destroy() {
    this.logger.log('Destroy Electrum Service')
    this.disconnect()
  }

  disconnect() {
    if (this.client.isConnected) {
      this.client.disconnect();
    }
  }

  async getAddressBalance(address: string): Promise<number> {
    await this.client.connect();
    const addressToScript = addressToScriptHash(address.trim());
    const response = await this.client.send('blockchain.scripthash.get_balance', [addressToScript])
    return response.confirmed
  }

  async getAddressBalances(addresses: string[]): Promise<Map<string, number>> {
    await this.client.connect();
    const results = await this.client.getAddressBalances(addresses);
    const ret = new Map<string, number>();
    for (let i = 0; i < results.length; i++) {
      ret.set(results[i].id, results[i].confirmed);
    }
    return ret;
  }

  async getLatestBlock(): Promise<string> {
    // todo - find the electrumX api for this
    return this.bitcoinCoreService.getApi(this.network).getBestBlockHash();
  }

  private convertElectrumTx(electrumTx: any): Transaction {
    return {
      txid: electrumTx.txid,
      inputs: electrumTx.vin.map(input => ({
        txid: input.txid,
        outputIndex: input.vout
      })),
      outputs: electrumTx.vout.map(output => ({
        value: Math.round(output.value * satoshiInBitcoin),
        address: output.scriptPubKey.address
      })),
      fee: null,
      blockTime: electrumTx.blocktime,
      inputValue: 0
    }
  }

  async getTransaction(txid: string): Promise<Transaction> {
    await this.client.connect();
    const electrumTx = await this.client.send('blockchain.transaction.get', [txid, true])
    return this.convertElectrumTx(electrumTx)
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> {
    await this.client.connect();
    const scriptHash = addressToScriptHash(address);
    const txsRefs: ElectrumTxForAddress[] = await this.client.send('blockchain.scripthash.get_history', [scriptHash])

    const ret: Transaction[] = []
    for (const txsRef of txsRefs) {
      const tx = await this.getTransaction(txsRef.tx_hash);
      ret.push(tx)
    }
    return ret;
  }

  async addressHasTransactions(address: string): Promise<boolean> {
    await this.client.connect();
    const scriptHash = addressToScriptHash(address);
    const txs = await this.client.send('blockchain.scripthash.get_history', [scriptHash]);
    return txs && txs.length > 0
  }

  async testService(): Promise<void> {
    this.client.check();
    return await super.testService()
  }

  getBlockDetails(blockHash: string, network: Network): Promise<BitcoinCoreBlock> {
    return this.bitcoinCoreService.getApi(network).getBlockDetail(blockHash)
  }

}
