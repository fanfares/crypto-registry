import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { getWalletBalance } from './get-wallet-balance';


export class TransactionInput {
  @ApiProperty()
  txid: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  value: number;
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
  blockTime: Date

  @ApiProperty()
  inputValue: number;

  @ApiProperty({ type: TransactionInput, isArray: true })
  inputs: TransactionInput[];

  @ApiProperty({ type: TransactionOutput, isArray: true })
  outputs: TransactionOutput[];
}


@Injectable()
export abstract class BitcoinService {
  abstract getAddressBalance(address: string): Promise<number>;

  abstract getTransaction(txid: string): Promise<Transaction>;

  abstract getTransactionsForAddress(address: string): Promise<Transaction[]> ;

  async getWalletBalance(zpub: string): Promise<number> {
    return await getWalletBalance(zpub, this)
  }
}
