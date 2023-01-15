import { MessageSenderService } from './message-sender.service';
import { Message } from './message';
import { P2pService } from './p2p.service';

export class MockMessageSenderService implements MessageSenderService {

  private nodes = new Map<string, P2pService>();

  async sendMessage(sender: string, destination: string, message: Message): Promise<void> {
    console.log(`sending ${sender} -> ${destination} - ${message.toString()}`);
    const destinationNode = this.nodes.get(destination);
    await destinationNode.receiveMessage(message);
  }

  addNode(node: P2pService) {
    this.nodes.set(node.apiConfigService.p2pLocalAddress, node);
  }

}
