import { Message } from '@bcr/types';
import { Subject } from 'rxjs';

export abstract class MessageTransportService {
  receivedMessage$ = new Subject<Message>();

  abstract sendMessage(
    destination: string,
    message: Message
  ): Promise<void>;

  receiveMessage(message: Message) {
    this.receivedMessage$.next(message);
  }
}
