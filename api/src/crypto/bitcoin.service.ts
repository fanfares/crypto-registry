import { ApiProperty } from '@nestjs/swagger';
import { getWalletBalance } from './get-wallet-balance';
import { isValidZpub } from './is-valid-zpub';
import { BadRequestException, Logger } from '@nestjs/common';
import { AmountSentBySender, Network } from '@bcr/types';
import { Tx } from '@mempool/mempool.js/lib/interfaces';
import { plainToClass } from 'class-transformer';
import { isAddressFromWallet } from "./is-address-from-wallet";


export class TransactionInput {
  @ApiProperty()
  txid: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  value: number;

  @ApiProperty()
  outputIndex: number;
}

export class TransactionOutput {
  @ApiProperty()
  address: string;

  @ApiProperty()
  value: number;
}

export class Transaction {
  @ApiProperty()
  txid: string;

  @ApiProperty()
  fee: number;

  @ApiProperty()
  blockTime: Date;

  @ApiProperty()
  inputValue: number;

  @ApiProperty({type: TransactionInput, isArray: true})
  inputs: TransactionInput[];

  @ApiProperty({type: TransactionOutput, isArray: true})
  outputs: TransactionOutput[];
}


export abstract class BitcoinService {
  protected constructor(
    public logger: Logger,
    protected network: Network,
    public name: string
  ) {
  }

  destroy() { // eslint-ignore-line
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

  validateZPub(zpub: string): void {
    if (!isValidZpub(zpub)) {
      throw new BadRequestException('Public Key is invalid. See BIP32');
    }
    const expectedPrefix = this.network === Network.mainnet ? 'zpub' : 'vpub';
    const prefix = zpub.slice(0, 4);
    if (expectedPrefix !== prefix) {
      throw new BadRequestException(`Public Key on ${this.network} should start with '${expectedPrefix}'.`);
    }
  }

  abstract getAddressBalance(address: string): Promise<number>;

  abstract getTransaction(txid: string): Promise<Transaction>;

  abstract getTransactionsForAddress(address: string): Promise<Transaction[]> ;

  async getWalletBalance(zpub: string): Promise<number> {
    this.logger.log(`get-wallet-balance: ${this.network} ${zpub} ${this.name}`)
    return await getWalletBalance(zpub, this);
  }

  async testService() {
    try {
      this.logger.debug('Service Test ' + this.name + ' on ' + this.network)
      await this.getAddressBalance('tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul')
      this.logger.debug('Service Passed ' + this.name + ' on ' + this.network)
    } catch (err) {
      this.logger.error('Service Failed ' + this.name + ' on ' + this.network)
    }
  }

  abstract getLatestBlock(): Promise<string>;

  async getAmountSentBySender(
    address: string,
    searchZpub: string
  ): Promise<AmountSentBySender> {
    const transactionsForAddress: Transaction[] = await this.getTransactionsForAddress(address)

    if (transactionsForAddress.length === 0) {
      return {
        noTransactions: true,
        senderMismatch: false,
        valueOfOutputFromSender: 0
      }
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
        .filter(o => isAddressFromWallet(o.address, searchZpub))

      if (changeOutput.length > 0) {
        senderMismatch = false;
        const destOutputs: TxOutput[] = tx.outputs
          .filter(o => o.address === address)
        outputValue += destOutputs.reduce((t, o) => t + o.value, 0)
      }
    }

    return {
      valueOfOutputFromSender: outputValue,
      senderMismatch: senderMismatch,
      noTransactions: false
    };
  }

  async addressHasTransactions(address: string): Promise<boolean> {
    const txs = await this.getTransactionsForAddress(address)
    return txs.length > 0
  }
}
