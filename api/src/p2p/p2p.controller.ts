import { Body, Controller, Get, Post, BadRequestException } from '@nestjs/common';
import { P2pService } from './p2p.service';
import { Message, MessageType, NetworkStatusDto } from '@bcr/types';
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

  @Get()
  @ApiResponse({ type: NetworkStatusDto })
  async getNetworkStatus(): Promise<NetworkStatusDto> {
    return {
      nodeName: this.apiConfigService.nodeName,
      address: this.apiConfigService.p2pLocalAddress,
      nodes: await this.p2pService.getNodes(),
      messages: await this.p2pService.getMessages()
    };
  }

  @Post('request-to-join')
  async requestToJoin(): Promise<void> {
    await this.p2pService.requestToJoin();
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
    if (this.p2pService.nodes.length === 0) {
      throw new BadRequestException('Cannot broadcast since Network has zero nodes');
    }
    const message = Message.createMessage(MessageType.textMessage, this.apiConfigService.nodeName, broadcastMessageDto.message);
    await this.p2pService.sendBroadcastMessage(message);
  }
}
