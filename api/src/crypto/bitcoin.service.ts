import { ApiProperty } from '@nestjs/swagger';
import { getWalletBalance } from './get-wallet-balance';
import { isValidZpub } from './is-valid-zpub';
import { Logger, BadRequestException } from '@nestjs/common';
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


export abstract class BitcoinService {
  protected constructor(
    protected logger: Logger,
    protected network: Network
  ) {
  }

  validateZPub(zpub: string): void {
    if (!isValidZpub(zpub)) {
      throw new BadRequestException('Public Key is invalid. See BIP32');
    }
  }

  abstract getAddressBalance(address: string): Promise<number>;

  abstract getTransaction(txid: string): Promise<Transaction>;

  abstract getTransactionsForAddress(address: string): Promise<Transaction[]> ;

  async getWalletBalance(zpub: string): Promise<number> {
    return await getWalletBalance(zpub, this, this.logger, this.network);
  }
}
