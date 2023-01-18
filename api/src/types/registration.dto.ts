import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean, IsArray } from 'class-validator';
import { ApprovalStatus } from './registration.db';
import { Type } from 'class-transformer';

export class RegistrationRequestDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class RegistrationApprovalStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  status: ApprovalStatus;
}

export class RegistrationStatusDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  status: ApprovalStatus;

  @ApiProperty()
  @IsArray()
  @Type(() => RegistrationApprovalStatusDto)
  approvals: RegistrationApprovalStatusDto[];
}

export class RegistrationApprovalDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  approved: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}

export class TokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;
}
