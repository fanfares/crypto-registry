import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDate, IsBoolean, IsEnum } from 'class-validator';
import { DatabaseRecord } from './db.types';
import { Network } from './network.type';

export class CustomerHolding {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  submissionId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hashedEmail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  paymentAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isCurrent: boolean;

  @ApiProperty({ enum: Network,enumName: 'Network' })
  @IsNotEmpty()
  @IsEnum(Network)
  network: Network
}

export class CustomerHoldingRecord
  extends CustomerHolding
  implements DatabaseRecord {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  _id: string;

  @ApiProperty({
    description: 'Date on which the employee document was created'
  })
  @IsDate()
  @IsNotEmpty()
  createdDate: Date;

  @ApiProperty({
    description: 'Date on which the employee document was last updated'
  })
  @IsNotEmpty()
  @IsDate()
  updatedDate: Date;
}

export class SendTestEmailDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;
}
