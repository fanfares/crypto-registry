import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  path: '/event'
})
export class EventGateway implements OnModuleInit {

  count = 0;

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('reset')
  async subCount(): Promise<void> {
    this.count = 0;
  }

  emitNodes(nodeList) {
    this.server.emit('nodes', nodeList);
  }

  emitMessages(messages) {
    this.server.emit('messages', messages);
  }

  onModuleInit(): any {
    setInterval(() => {
      this.count++;
      this.server.emit('count', this.count);
    }, 2000);

    this.emitMessages([]);
    this.emitNodes([]);
  }
}
