import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { P2pService } from './p2p.service';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  path: '/event'
})
export class EventGateway implements OnModuleInit {

  count = 0;

  constructor(private p2pService: P2pService) {
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('reset')
  async subCount(@MessageBody() data: number): Promise<void> {
    this.count = 0;
    console.log('count', data);
  }

  onModuleInit(): any {
    this.p2pService.peers$.subscribe(nodeList => {
      this.server.emit('nodes', nodeList);
    });
    this.p2pService.messages$.subscribe(messages => {
      this.server.emit('messages', messages);
    });
    setInterval(() => {
      this.count++;
      this.server.emit('count', this.count);
    }, 2000);
  }
}
