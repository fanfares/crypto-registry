import { MessageTransportService } from './message-transport.service';
import { Message } from '@bcr/types';
import { MessageReceiverService } from './message-receiver.service';

export class MockMessageTransportService extends MessageTransportService {

  private receivers = new Map<string, MessageReceiverService>();

  async sendMessage(destination: string, message: Message): Promise<void> {
    const receiver = this.receivers.get(destination);
    await receiver.receiveMessage(message);
  }

  addNode(nodeName: string, receiver: MessageReceiverService) {
    this.receivers.set(nodeName, receiver);
  }

}
