import { BitcoinService, OutputAddress, Transaction } from "../crypto";
import { Logger } from "@nestjs/common";
import { Network } from "@bcr/types";
import { ElectrumWsClient } from "./electrum-ws-client";
import { addressToScriptHash } from "./address-to-script-hash";
import { ApiConfigService } from "../api-config";
import { BlockstreamBitcoinService } from "../crypto/blockstream-bitcoin.service";

interface ElectrumTxForAddress {
  tx_hash: string;
  height: number;
}


export class ElectrumBitcoinService extends BitcoinService {
  private client: ElectrumWsClient;
  private blockStreamService: BlockstreamBitcoinService

  constructor(
    network: Network,
    logger: Logger,
    config: ApiConfigService
  ) {
    super(logger, network);
    const url = network === Network.testnet ? config.electrumTestnetUrl : config.electrumMainnetUrl
    this.client = new ElectrumWsClient(url)
    this.blockStreamService = new BlockstreamBitcoinService(network, logger);
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
    // await this.client.connect();
    // return Promise.resolve("");
    return this.blockStreamService.getLatestBlock();
  }

  private convertElectrumTx(electrumTx: any): Transaction {
    return {
      txid: electrumTx.txid,
      inputs: electrumTx.vin.map(input => ({
        txid: input.txid,
        outputIndex: input.vout
      })),
      outputs: electrumTx.vout.map(output => ({
        value: output.value,
        address: output.scriptPubKey.address
      })),
      fee: null,
      blockTime: electrumTx.blocktime,
      inputValue: 0
    }
  }

  async getTransaction(txid: string): Promise<Transaction> {
    // return await this.blockStreamService.getTransaction(txid)
    await this.client.connect();
    const electrumTx = await this.client.send('blockchain.transaction.get', [txid, true])
    return this.convertElectrumTx(electrumTx)
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> {
    // return await this.blockStreamService.getTransactionsForAddress(address);
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

  async getPreviousOutputAddress(address: string): Promise<OutputAddress[] | null> {
    await this.client.connect();
    const scriptHash = addressToScriptHash(address);
    const electrumTxsForAddress: ElectrumTxForAddress[] = await this.client.send('blockchain.scripthash.get_history', [scriptHash])

    const outputAddresses: OutputAddress[] = []
    for (const electrumTxForAddress of electrumTxsForAddress) {
      const electrumTxDetail: ElectrumTxForAddress = await this.client.send('blockchain.transaction.get', [electrumTxForAddress.tx_hash, true])
      const inputTx = this.convertElectrumTx(electrumTxDetail);
      const inputTxInputs = inputTx.inputs

      for (const inputTxInput of inputTxInputs) {
        const electrumInputTx = await this.client.send('blockchain.transaction.get', [inputTxInput.txid, true])
        const electrumInputTxConverted = this.convertElectrumTx(electrumInputTx)
        const output = electrumInputTxConverted.outputs[inputTxInput.outputIndex];
        outputAddresses.push({
          address: output.address,
          value: output.value
        })
      }
    }
    return outputAddresses;
  }
}
