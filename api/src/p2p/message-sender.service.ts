import { Message } from '@bcr/types';

export abstract class MessageSenderService {
  abstract sendMessage(
    destination: string,
    message: Message
  ): Promise<void>;
}
