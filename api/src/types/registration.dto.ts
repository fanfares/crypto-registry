import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApprovalStatus } from './registration.types';

export class SendRegistrationRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  toNodeAddress: string;
}

export class RegistrationMessageDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromNodeAddress: string; // todo - duplicates sender on message

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromNodeName: string; // todo - duplicates sender on message

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fromPublicKey: string;
}

export class ApprovalDto {
  @ApiProperty()
  institutionName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({enum: ApprovalStatus, enumName: 'ApprovalStatus'})
  status: ApprovalStatus;
}

export class RegistrationDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  nodeName: string;

  @ApiProperty()
  nodeAddress: string;

  @ApiProperty()
  institutionName: string;

  @ApiProperty({enum: ApprovalStatus, enumName: 'ApprovalStatus'})
  status: ApprovalStatus;
}

export class RegistrationStatusDto {
  @ApiProperty({type: RegistrationDto})
  registration: RegistrationDto;

  @ApiProperty({type: ApprovalDto, isArray: true})
  approvals: ApprovalDto[];
}

export class ApprovalStatusDto {
  @ApiProperty()
  institutionName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({enum: ApprovalStatus, enumName: 'ApprovalStatus'})
  status: ApprovalStatus;

  @ApiProperty({type: RegistrationDto})
  registration: RegistrationDto;
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
