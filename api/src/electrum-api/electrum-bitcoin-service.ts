import { BitcoinService, Transaction } from "../crypto";
import { Logger } from "@nestjs/common";
import { Network } from "@bcr/types";
import { ElectrumWsClient } from "./electrum-ws-client";
import { addressToScriptHash } from "./address-to-script-hash";
import { ApiConfigService } from "../api-config";

export class ElectrumBitcoinService extends BitcoinService {
  private client: ElectrumWsClient

  constructor(
    network: Network,
    logger: Logger,
    config: ApiConfigService
  ) {
    super(logger, network);
    const url = network === Network.testnet ? config.electrumTestnetUrl : config.electrumMainnetUrl
    this.client = new ElectrumWsClient(url)
  }

  disconnect() {
    this.client.disconnect();
  }

  async getAddressBalance(address: string): Promise<number> {
    await this.client.connect();
    const addressToScript = addressToScriptHash(address);
    const response = await this.client.send('blockchain.scripthash.get_balance', [addressToScript])
    return response.confirmed
  }

  async getLatestBlock(): Promise<string> {
    await this.client.connect();
    return Promise.resolve("");
  }

  private convertElectrumTx(electrumTx: any): Transaction {
    return {
      txid: electrumTx.txid,
      inputs: electrumTx.vin.map(input => ({})),
      outputs: [],
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
    return await this.client.send('blockchain.scripthash.get_history', [scriptHash])
  }
}
