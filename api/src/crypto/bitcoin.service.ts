import { ApiProperty } from '@nestjs/swagger';
import { getWalletBalance } from './get-wallet-balance';
import { isValidZpub } from './is-valid-zpub';
import { Logger, BadRequestException } from '@nestjs/common';
import { Network } from '@bcr/types';
import { Tx } from '@mempool/mempool.js/lib/interfaces';
import { plainToClass } from 'class-transformer';


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

export interface AmountSentBySender {
  senderMismatch: boolean;
  noTransactions: boolean;
  valueOfOutputFromSender: number;
}

export abstract class BitcoinService {
  protected constructor(
    protected logger: Logger,
    protected network: Network
  ) {
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
    return await getWalletBalance(zpub, this);
  }

  abstract getLatestBlock(): Promise<string>;

  abstract getAmountSentBySender(
    address: string,
    senderZpub: string
  ): Promise<AmountSentBySender>

  abstract addressHasTransactions(address: string): Promise<boolean>
}
