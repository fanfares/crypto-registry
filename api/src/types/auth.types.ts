import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class SendAgainDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @ValidateIf(val => !val.invite)
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @ValidateIf(val => val.invite)
  userId?: string;

  @ApiProperty({type: Boolean})
  @IsBoolean()
  @IsNotEmpty()
  invite: boolean;
}
