import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { v4 as uuidv4 } from 'uuid';


export type MessageType = 'join' | 'new-peer' | 'peer-list';

export class MessagePayload {
  @ApiProperty()
  type: MessageType;

  @ApiPropertyOptional()
  data?: any;
}

export class Message {
  constructor(type: MessageType, data?: any) {
    this.id = uuidv4();
    this.payload = {
      type: type,
      data: data
    };
  }

  @ApiProperty()
  public payload: MessagePayload;

  @ApiProperty({ isArray: true })
  public recipientAddresses: string[] = [];

  @ApiProperty()
  public id: string;

  toString() {
    return `${this.payload.type} ${this.payload.data ? '(' + this.payload.data + ')' : ''}`;
  }

}

