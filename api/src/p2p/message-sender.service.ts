import { Message } from './message';

export interface MessageSenderService {
  sendMessage(
    sender: string,
    destination: string,
    message: Message
  ): Promise<void>;
}
