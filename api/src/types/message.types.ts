import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';


export enum MessageType {
  registration = 'registration',
  nodeJoined = 'node-joined',
  nodeList = 'node-list',
  ping = 'ping',
  createSubmission = 'createSubmission',
  submissionCancellation = 'submission-cancellation',
  verify = 'verify',
  removeNode = 'remove-node',
  discover = 'discover',
  confirmVerification = 'confirm-verification',
  confirmSubmissions = 'confirm-submission',
  syncRequest = 'sync-request',
  syncData = 'sync-data',
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
