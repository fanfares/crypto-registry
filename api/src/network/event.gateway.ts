import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { NodeDto } from '@bcr/types';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  path: '/api/event'
})
export class EventGateway implements OnModuleInit {

  count = 0;

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('reset')
  onReset(
    // @MessageBody() body: any
  ) {
    console.log('reset');
    this.count = 0;
  }

  @SubscribeMessage('callback')
  onCallback(
    // @MessageBody() body: any
  ) {
    console.log('callback');
    this.count = 0;
  }

  emitNodes(nodeList: NodeDto[]) {
    this.server.emit('nodes', nodeList);
  }

  onModuleInit(): any {

    this.server.on('connection', (socket) => {
      console.log(socket.id + ' connected');
    });

    this.server.on('disconnect', (socket) => {
      console.log(socket.id + ' disconnect');
    });

    this.server.on('disconnected', (socket) => {
      console.log(socket.id + ' disconnected');
    });

    this.server.on('newListener', (socket) => {
      console.log(socket.id + ' newListener');
    });

    // this.server.

    setInterval(() => {
      this.count++;
      this.server.emit('count', this.count);
    }, 2000);

    this.emitNodes([]);
  }
}
