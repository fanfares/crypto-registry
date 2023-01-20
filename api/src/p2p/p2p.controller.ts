import { Body, Controller, Get, Post } from '@nestjs/common';
import { P2pService } from './p2p.service';
import { Message } from './message';
import { Peer } from './peer';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('network')
@ApiTags('network')
export class P2pController {

  constructor(private p2pService: P2pService) {
  }

  @Get('peers')
  @ApiResponse({ type: Peer, isArray: true })
  async getPeers(): Promise<Peer[]> {
    return await this.p2pService.getPeers();
  }

  @Post('join')
  @ApiResponse({ type: Peer, isArray: true })
  async join(): Promise<void> {
    return await this.p2pService.joinNetwork();
  }

  @Post('message')
  @ApiBody({ type: Message })
  async receiveMessage(
    @Body() message: Message
  ) {
    await this.p2pService.receiveMessage(message);
  }
}
