import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class IsValid {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isValid: boolean;
}
