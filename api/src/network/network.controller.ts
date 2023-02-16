import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageSenderService } from './message-sender.service';
import { Message, MessageType, NetworkStatusDto } from '@bcr/types';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BroadcastMessageDto } from '../types/broadcast-message.dto';
import { ApiConfigService } from '../api-config';
import { MessageReceiverService } from './message-receiver.service';

@Controller('network')
@ApiTags('network')
export class NetworkController {

  constructor(
    private messageSenderService: MessageSenderService,
    private messageReceiverService: MessageReceiverService,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Get()
  @ApiResponse({ type: NetworkStatusDto })
  async getNetworkStatus(): Promise<NetworkStatusDto> {
    return {
      nodeName: this.apiConfigService.nodeName,
      address: this.apiConfigService.nodeAddress,
      nodes: await this.messageSenderService.getNodeDtos(),
      messages: await this.messageSenderService.getMessageDtos()
    };
  }

  @Post('receive-message')
  @ApiBody({ type: Message })
  async receiveMessage(
    @Body() message: Message
  ) {
    await this.messageReceiverService.receiveMessage(message);
  }

  @Post('broadcast-message')
  @ApiBody({ type: BroadcastMessageDto })
  async broadcastMessage(
    @Body() broadcastMessageDto: BroadcastMessageDto
  ) {
    await this.messageSenderService.sendBroadcastMessage(MessageType.textMessage, broadcastMessageDto.message);
  }
}
