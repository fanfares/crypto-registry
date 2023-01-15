import { Injectable } from '@nestjs/common';
import { Message } from './message';
import axios from 'axios';
import { MessageSenderService } from './message-sender.service';


@Injectable()
export class AxiosMessageSenderService implements MessageSenderService {
  async sendMessage(
    sender: string,
    destination: string,
    message: Message
  ): Promise<void> {
    await axios.post(`${destination}/message`, {
      message
    });
  }
}
