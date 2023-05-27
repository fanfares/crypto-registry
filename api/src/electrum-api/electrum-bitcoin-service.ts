import { BitcoinService, Transaction } from "../crypto";
import { Logger } from "@nestjs/common";
import { Network } from "@bcr/types";
import { ElectrumWsClient } from "./electrum-ws-client";
import { addressToScriptHash } from "./address-to-script-hash";

export class ElectrumBitcoinService extends BitcoinService {

  constructor(
    network: Network,
    logger: Logger,
    private client: ElectrumWsClient
  ) {
    super(logger, network);
  }

  async getAddressBalance(address: string): Promise<number> {
    const addressToScript = addressToScriptHash(address)
    const response = await this.client.send('blockchain.scripthash.get_balance', [addressToScript])
    return response.confirmed
  }

  getLatestBlock(): Promise<string> {
    return Promise.resolve("");
  }

  async getTransaction(txid: string): Promise<Transaction> {
    const response = await this.client.send('blockchain.transaction.get', ['88d36154f78b64ac7713e7fcebd00d56fbfe0482aa1fb550376eea91a64fb6ef', true])
    return Promise.resolve(undefined);
  }

  getTransactionsForAddress(address: string): Promise<Transaction[]> {
    return Promise.resolve([]);
  }


}
