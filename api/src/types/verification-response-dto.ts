import { ApiProperty } from '@nestjs/swagger';

export class VerificationResponseDto {
  @ApiProperty()
  selectedEmailNode: string;
}
