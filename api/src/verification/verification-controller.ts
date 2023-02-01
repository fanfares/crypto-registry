import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { VerificationRequestDto, MessageType } from '@bcr/types';
import { VerificationService } from './verification.service';
import { MessageSenderService } from '../network/message-sender.service';
import { DbService } from '../db/db.service';
import { VerificationResponseDto } from '../types/verification-response-dto';

@ApiTags('verification')
@Controller('verification')
export class VerificationController {

  constructor(
    private verificationService: VerificationService,
    private messageSenderService: MessageSenderService,
    private dbService: DbService
  ) {
  }

  @Post()
  @ApiBody({ type: VerificationRequestDto })
  @ApiResponse({ type: VerificationResponseDto })
  async verify(
    @Body() body: VerificationRequestDto
  ): Promise<VerificationResponseDto> {
    const nodes = await this.dbService.nodes.find({});
    const selectedNode = nodes[Math.floor(Math.random() * nodes.length)];
    await this.messageSenderService.sendDirectMessage(selectedNode.address, MessageType.verify, JSON.stringify(body));
    await this.verificationService.verify(body, false);
    return { selectedEmailNode: selectedNode.nodeName };
  }

}
