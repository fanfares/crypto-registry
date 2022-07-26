import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { DatabaseRecord } from './db.types';
import { UserIdentity } from './user-identity.types';

export class CustodianWalletBase {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  custodianName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  publicKey: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isValidated: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  customerBalance: number;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  blockChainBalance?: number;
}

export class CustodianWalletRecord extends CustodianWalletBase implements DatabaseRecord {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  _id: string;

  @ApiProperty({description: 'Date on which the employee document was created'})
  @IsDate()
  @IsNotEmpty()
  createdDate: Date;

  @ApiProperty({description: 'Identity who created record'})
  @IsDate()
  @IsNotEmpty()
  createdBy: UserIdentity;

  @ApiProperty({description: 'The identity of the last user to make an update'})
  @IsDate()
  @IsNotEmpty()
  updatedBy: UserIdentity;

  @ApiProperty({description: 'Date on which the employee document was last updated'})
  @IsNotEmpty()
  @IsDate()
  updatedDate: Date;
}
