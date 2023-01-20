import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';


export enum MessageType {
  join = 'join',
  newAddress = 'new-address',
  addressList = 'address-list'
}

export class Message {
  @ApiProperty()
  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  data?: string;

  @ApiProperty({ isArray: true })
  @IsArray()
  @Type(() => String)
  @IsNotEmpty()
  recipientAddresses: string[] = [];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  public static createMessage(
    type: MessageType,
    data?: string
  ): Message {
    return {
      id: uuidv4(),
      type: type,
      data: data ? data : undefined,
      recipientAddresses: []
    };
  }
}


