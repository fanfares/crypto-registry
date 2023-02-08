import { MessageReceiverService } from './message-receiver.service';
import { Message } from '@bcr/types';

export class MockMessageReceiverService extends MessageReceiverService {

  message: Message;

  constructor() {
    super(null, null, null, null, null, null, null, null );
  }

  async receiveMessage(message: Message) {
    this.message = message;
  }
}
