import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerificationRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class VerificationMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  selectedNodeAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  initialNodeAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  blockHash: string;
}
