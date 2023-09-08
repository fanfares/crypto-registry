import { Body, Controller, Post } from '@nestjs/common';
import { Message } from '@bcr/types';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { MessageReceiverService } from './message-receiver.service';

@Controller('network')
@ApiTags('network')
export class NetworkController {

  constructor(
    private messageReceiverService: MessageReceiverService
  ) {
  }

  @Post('receive-message')
  @ApiBody({type: Message})
  async receiveMessage(
    @Body() message: Message
  ) {
    await this.messageReceiverService.receiveMessage(message);
  }
}
