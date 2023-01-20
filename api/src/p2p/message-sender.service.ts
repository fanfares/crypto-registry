import { Message } from './message';

export abstract class MessageSenderService {
  abstract sendMessage(
    sender: string,
    destination: string,
    message: Message
  ): Promise<void>;
}
