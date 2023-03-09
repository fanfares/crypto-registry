import { VerificationBase } from './verification-db.types';
import { ApiProperty } from '@nestjs/swagger';

export class VerificationDto extends VerificationBase {
  @ApiProperty()
  requestDate: Date
}
