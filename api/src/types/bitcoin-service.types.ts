import { ApiProperty } from '@nestjs/swagger';

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

export class BlockHash {
  @ApiProperty()
  hash: string
}
