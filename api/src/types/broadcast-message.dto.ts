import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class BroadcastMessageDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string
}
