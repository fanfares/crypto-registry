import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Network } from './network.type';
import { ScriptType } from '../crypto';

export class ViewWalletRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  extendedKey: string;
}

export enum AddressType {
  RECEIVE = 'receive',
  CHANGE = 'change'
}

export class AddressDto {
  @ApiProperty()
  index: number;

  @ApiProperty()
  address: string;

  @ApiProperty()
  balance: number;

  @ApiProperty({enum: AddressType, enumName: 'AddressType'})
  type: AddressType;
}

export class WalletDto {
  @ApiProperty()
  derivationPath: string;

  @ApiProperty({enumName: 'Network', enum: Network})
  network: Network;

  @ApiProperty()
  scriptType: ScriptType;

  @ApiProperty()
  typeDescription: string;

  @ApiProperty()
  balance: number;

  @ApiProperty({isArray: true, type: AddressDto})
  addresses: AddressDto[];
}
