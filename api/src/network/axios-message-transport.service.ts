import { BadRequestException, Injectable } from '@nestjs/common';
import { Message } from '@bcr/types';
import axios, { AxiosError } from 'axios';
import { MessageTransportService } from './message-transport.service';


@Injectable()
export class AxiosMessageTransportService extends MessageTransportService {
  async sendMessage(
    destinationAddress: string,
    message: Message
  ): Promise<void> {
    try {
      console.log(`${message.senderAddress} => ${destinationAddress}:${JSON.stringify(message)}`);
      await axios.post(`${destinationAddress}/api/network/receive-message`, message, {
        headers: {
          'content-type': 'application/json',
          accept: 'application/json'
        }
      });
    } catch (err) {
      let message = err.message;
      if (err instanceof AxiosError) {
        message = err.response?.data.message;
      }
      throw new BadRequestException(message);
    }
  }
}
