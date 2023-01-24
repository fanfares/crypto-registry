import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';


export enum MessageType {
  joinRequest = 'join-request',
  nodeJoined = 'node-joined',
  nodeList = 'node-list',
  textMessage = 'text-message'
}

export class Message {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sender: string;

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

  public static createMessage(
    type: MessageType,
    sender: string,
    data: string
  ): Message {
    return {
      id: uuidv4(),
      sender: sender,
      type: type,
      data: data ? data : undefined,
      recipientAddresses: []
    };
  }
}

export class MessageDto extends Message {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isSender: boolean;
}

export class MessageBase<T> {

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sender: string;

  @ApiProperty()
  @IsEnum(MessageType)
  @IsNotEmpty()
  type: MessageType;

  @ApiProperty({ isArray: true })
  @IsArray()
  @Type(() => String)
  @IsNotEmpty()
  recipientAddresses: string[] = [];

  data?: T;

}

//
// export class NodeListMessage extends MessageBase<Node[]> {
//   @ApiProperty()
//   @IsArray()
//   @Type(() => Node)
//   payload: Node[];
//
//
// }
//
// export class JoinMessage extends MessageBase<JoinMessageData> {
//
// }
//
// export class TextMessage extends Message<string> {
//
// }
//
// export class NodeJoinedMessage extends Message<Node> {
//
// }
//
// getMessageBase(message: Message)
