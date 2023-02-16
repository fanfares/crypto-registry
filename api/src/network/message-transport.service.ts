import { Message } from '@bcr/types';

export abstract class MessageTransportService {
  abstract sendMessage(
    destination: string,
    message: Message
  ): Promise<void>;
}
