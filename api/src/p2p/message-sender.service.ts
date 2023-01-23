import { Message } from './message';

export abstract class MessageSenderService {
  abstract sendMessage(
    destination: string,
    message: Message
  ): Promise<void>;
}
