import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class SendFundsDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  senderZpub: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  toAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
