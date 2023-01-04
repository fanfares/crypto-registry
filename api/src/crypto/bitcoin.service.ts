import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { getWalletBalance } from './get-wallet-balance';
import { Network } from '@bcr/types';


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
  blockTime: Date;

  @ApiProperty()
  inputValue: number;

  @ApiProperty({ type: TransactionInput, isArray: true })
  inputs: TransactionInput[];

  @ApiProperty({ type: TransactionOutput, isArray: true })
  outputs: TransactionOutput[];
}


@Injectable()
export abstract class BitcoinService {
  abstract getAddressBalance(address: string, network: Network): Promise<number>;

  abstract getTransaction(txid: string, network: Network): Promise<Transaction>;

  abstract getTransactionsForAddress(address: string, network: Network): Promise<Transaction[]> ;

  async getWalletBalance(zpub: string, network: Network): Promise<number> {
    return await getWalletBalance(zpub, network, this);
  }
}
