import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { VerificationRequestDto, MessageType, NodeRecord } from '@bcr/types';
import { VerificationService } from './verification.service';
import { MessageSenderService } from '../network/message-sender.service';
import { DbService } from '../db/db.service';
import { VerificationResponseDto } from '../types/verification-response-dto';
import { ApiConfigService } from '../api-config';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {

  constructor(
    private verificationService: VerificationService,
    private messageSenderService: MessageSenderService,
    private dbService: DbService,
    private apiConfigService: ApiConfigService
  ) {
  }

  @Post()
  @ApiBody({ type: VerificationRequestDto })
  @ApiResponse({ type: VerificationResponseDto })
  async verify(
    @Body() body: VerificationRequestDto
  ): Promise<VerificationResponseDto> {
    const nodes = await this.dbService.nodes.find({});
    const isConnected = nodes.length > 1
    let selectedNode: NodeRecord;
    if (isConnected ) {
      const nodesExLocal = nodes.filter(n => n.address !== this.apiConfigService.nodeAddress)
      selectedNode = nodesExLocal[Math.floor(Math.random() * nodesExLocal.length)];
      await this.messageSenderService.sendDirectMessage(selectedNode.address, MessageType.verify, JSON.stringify(body));
    } else {
      selectedNode = nodes[0]
    }
    await this.verificationService.verify(body, !isConnected);
    return { selectedEmailNode: selectedNode.nodeName };
  }
}
