import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { DatabaseRecord } from './db.types';

export class UserBase {
  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  passwordHash?: string;

  @ApiProperty()
  isVerified;

  @ApiPropertyOptional()
  lastSignIn?: Date;
}


export class UserRecord extends UserBase implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string
}

export class VerifyUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignInDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string
}

export class SignInTokens {
  idToken: string;
  idTokenExpiry: string;
  refreshToken: string;
  refreshTokenExpiry: string;
  userId: string;
  isAdmin: boolean;
}

export class CredentialsDto {
  @ApiProperty()
  idToken: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({type: Boolean})
  isAdmin: boolean;
}
