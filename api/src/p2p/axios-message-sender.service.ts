import { BadRequestException, Injectable } from '@nestjs/common';
import { Message } from './message';
import axios, { AxiosError } from 'axios';
import { MessageSenderService } from './message-sender.service';


@Injectable()
export class AxiosMessageSenderService implements MessageSenderService {
  async sendMessage(
    sender: string,
    destination: string,
    message: Message
  ): Promise<void> {
    try {
      console.log(`${sender} => ${destination}:${JSON.stringify(message)}`);
      await axios.post(`${destination}/api/network/message`, message, {
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        }
      });
    } catch (err) {
      let message = err.message;
      if ( err instanceof AxiosError) {
        message = err.response?.data.message
      }
      throw new BadRequestException(message)
    }
  }
}