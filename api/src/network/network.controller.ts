import { Body, Controller, Get, Post } from '@nestjs/common';
import { MessageSenderService } from './message-sender.service';
import { Message, MessageType, NetworkStatusDto, NodeAddress } from '@bcr/types';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiConfigService } from '../api-config';
import { MessageReceiverService } from './message-receiver.service';
import { NodeService } from './node.service';

@Controller('network')
@ApiTags('network')
export class NetworkController {

  constructor(
    private messageSenderService: MessageSenderService,
    private messageReceiverService: MessageReceiverService,
    private apiConfigService: ApiConfigService,
    private nodeService: NodeService
  ) {
  }

  @Get()
  @ApiResponse({ type: NetworkStatusDto })
  async getNetworkStatus(): Promise<NetworkStatusDto> {
    return {
      nodeName: this.apiConfigService.nodeName,
      address: this.apiConfigService.nodeAddress,
      nodes: await this.nodeService.getNodeDtos(),
    };
  }

  @Post('receive-message')
  @ApiBody({ type: Message })
  async receiveMessage(
    @Body() message: Message
  ) {
    await this.messageReceiverService.receiveMessage(message);
  }

  @Post('broadcast-ping')
  async broadcastPing(
  ) {
    await this.messageSenderService.sendBroadcastMessage(MessageType.ping, null);
  }

  @Post('remove-node')
  @ApiBody({ type: NodeAddress })
  async removeNode(
    @Body() body: NodeAddress
  ) {
    await this.nodeService.removeNode(body.nodeAddress);
    await this.messageSenderService.sendBroadcastMessage(
      MessageType.removeNode,
      body.nodeAddress
    );
  }
}
