import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class HashedEmailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hashedEmail: string;
}
