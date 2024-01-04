import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { NodeDto, FundingSubmissionDto, VerificationDto, ExchangeDto } from '@bcr/types';

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
  onReset() {
    this.count = 0;
  }

  emitNodes(nodeList: NodeDto[]) {
    this.server.emit('nodes', nodeList);
  }

  emitVerificationUpdates(verification: VerificationDto) {
    this.server.emit('verifications', verification);
  }

  emitFundingSubmissionUpdates(submissionDto: FundingSubmissionDto) {
    this.server.emit('funding-submissions', submissionDto);
  }

  emitExchange(exchangeDto: ExchangeDto) {
    this.server.emit('exchange', exchangeDto);
  }

  onModuleInit(): any {
    setInterval(() => {
      this.count++;
      this.server.emit('count', this.count);
    }, 2000);

    this.emitNodes([]);
  }
}
