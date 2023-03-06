import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerificationRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}
