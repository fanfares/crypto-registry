import { Body, Controller, Get, Post } from '@nestjs/common';
import { P2pService } from './p2p.service';
import { Message, MessageType, MessageDto, Node, NodeDto } from '@bcr/types';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BroadcastMessageDto } from '../types/broadcast-message.dto';
import { ApiConfigService } from '../api-config';

@Controller('network')
@ApiTags('network')
export class P2pController {

  constructor(
    private p2pService: P2pService,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Get('nodes')
  @ApiResponse({ type: NodeDto, isArray: true })
  async getNodes(): Promise<NodeDto[]> {
    return await this.p2pService.getNodes();
  }

  @Get('messages')
  @ApiResponse({ type: MessageDto, isArray: true })
  async getMessages(): Promise<MessageDto[]> {
    return this.p2pService.messages.map(m => ({
      ...m,
      isSender: m.sender === this.apiConfigService.nodeName
    }));
  }

  @Post('request-to-join')
  @ApiResponse({ type: Node, isArray: true })
  async join(): Promise<void> {
    return await this.p2pService.requestToJoin();
  }

  @Post('receive-message')
  @ApiBody({ type: Message })
  async receiveMessage(
    @Body() message: Message
  ) {
    await this.p2pService.receiveMessage(message);
  }

  @Post('broadcast-message')
  @ApiBody({ type: BroadcastMessageDto })
  async broadcastMessage(
    @Body() broadcastMessageDto: BroadcastMessageDto
  ) {
    const message = Message.createMessage(MessageType.textMessage, this.apiConfigService.nodeName, broadcastMessageDto.message);
    await this.p2pService.broadcastMessage(message);
  }
}
