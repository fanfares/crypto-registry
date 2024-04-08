import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

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

export class SendTestEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}


export class ServiceTestResultDto {
  @ApiProperty()
  bitcoinCoreMainnet: boolean;

  @ApiProperty()
  bitcoinCoreTestnet: boolean;

  @ApiProperty()
  electrumxMainnet: boolean;

  @ApiProperty()
  electrumxTestnet: boolean;
}
