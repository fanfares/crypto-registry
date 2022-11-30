import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { DatabaseRecord } from './db.types';
import { UserIdentity } from './user-identity.types';

export class ExchangeBase {
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
  @IsNumber()
  totalCustomerHoldings: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  blockChainBalance: number;
}

export class ExchangeRecord extends ExchangeBase implements DatabaseRecord {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Date on which the employee document was created',
  })
  @IsDate()
  @IsNotEmpty()
  createdDate: Date;

  @ApiProperty({ description: 'Identity who created record' })
  @IsDate()
  @IsNotEmpty()
  createdBy: UserIdentity;

  @ApiProperty({
    description: 'The identity of the last user to make an update',
  })
  @IsDate()
  @IsNotEmpty()
  updatedBy: UserIdentity;

  @ApiProperty({
    description: 'Date on which the employee document was last updated',
  })
  @IsNotEmpty()
  @IsDate()
  updatedDate: Date;
}

export enum SubmissionResult {
  UNREGISTERED_CUSTODIAN = 'unregistered-custodian',
  SUBMISSION_SUCCESSFUL = 'submission-successful',
  CANNOT_FIND_BCR_PAYMENT = 'cannot-find-payment',
  CANNOT_MATCH_CUSTOMER_HOLDINGS_TO_BLOCKCHAIN = 'cannot-match-customer-holdings-to-blockchain',
}

export class RegistrationCheckResult {
  @ApiProperty()
  isRegistered: boolean;

  @ApiProperty()
  isPaymentMade: boolean;
}

export class ExchangeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  _id: string;

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
  isRegistered: boolean;
}
