import { EventGateway } from './event.gateway';

export class MockEventGateway extends EventGateway {
  constructor() {
    super();
  }

  emitNodes(nodeList) { // eslint-disable-line
  }

  emitMessages(messages) { // eslint-disable-line
  }
}
