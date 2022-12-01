import { Coin } from './coin.type';
import { ApiProperty } from '@nestjs/swagger';

export interface Transaction {
  fromKey: string;
  toKey: string;
  coin: Coin;
  amount: number
}

export class TransactionDto implements Transaction{
  @ApiProperty()
  fromKey: string;

  @ApiProperty()
  toKey: string;

  @ApiProperty({
    enum: Coin,
    enumName: 'Coin'
  })
  coin: Coin;

  @ApiProperty()
  amount: number
}
