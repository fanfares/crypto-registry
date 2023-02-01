import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { DatabaseRecord } from './db.types';


export enum MessageType {
  registration = 'registration',
  joinRequest = 'join-request',
  nodeJoined = 'node-joined',
  nodeList = 'node-list',
  textMessage = 'text-message',
  submission = 'submission',
  verify = 'verify'
}

export class Message {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  senderName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  senderAddress: string;

  @ApiProperty()
  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  data?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ isArray: true })
  @IsArray()
  @Type(() => String)
  @IsNotEmpty()
  recipientAddresses: string[] = [];

  static createMessage(
    type: MessageType,
    senderName: string,
    senderAddress: string,
    data: string
  ): Message {
    return {
      id: uuidv4(),
      senderAddress: senderAddress,
      senderName: senderName,
      type: type,
      data: data ? data : undefined,
      signature: '',
      recipientAddresses: []
    };
  }
}

export class MessageRecord extends Message implements DatabaseRecord {
  _id: string;
  createdDate: Date;
  updatedDate: Date;
}

export class MessageDto extends MessageRecord {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isSender: boolean;
}
