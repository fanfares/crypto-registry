import { Controller, Get, Post, Body } from '@nestjs/common';
import { P2pService } from './p2p.service';
import { Message } from './message';

@Controller()
export class P2pController {

  constructor(private p2pService: P2pService) {
  }

  @Get('peers')
  getPeers() {
    this.p2pService.getPeers();
  }

  @Post('message')
  async receiveMessage(
    @Body() message: Message
  ) {
    await this.p2pService.receiveMessage(message);
  }
}
