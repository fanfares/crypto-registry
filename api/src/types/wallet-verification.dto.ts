import { CustodianWalletBase } from './custodian-wallet.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class WalletVerificationDto extends CustodianWalletBase {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  customerBalance: number
}
