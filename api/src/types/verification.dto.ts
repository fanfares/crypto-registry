import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum VerificationResult {
  EMAIL_SENT = 'email-sent',
  FAILED_TO_SEND_EMAIL = 'failed-to-send-email',
  CANT_FIND_HOLDINGS_FOR_EMAIL = 'cant-find-holdings-for-email',
  CANT_FIND_VERIFIED_HOLDINGS_FOR_EMAIL = 'cant-find-verified-holdings-for-email',
}

export class VerificationDto {
  @ApiProperty({ enum: VerificationResult, enumName: 'VerificationResult' })
  @IsEnum(VerificationResult)
  @IsNotEmpty()
  verificationResult: VerificationResult;
}
