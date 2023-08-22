import { v4 as uuid } from 'uuid';
import WebSocket from 'ws';
import { Logger} from '@nestjs/common';

export class ElectrumWsClient {
  public socket: WebSocket;
  private readonly url: string;
  private callbacks: Map<string, { resolve: (value: any) => void, reject: (reason: any) => void }>;

  constructor(url: string, private logger: Logger) {
    this.url = url;
    this.socket = new WebSocket(url);
    this.callbacks = new Map();

    this.socket.on('message', (message: string) => {
      const response = JSON.parse(message);
      const callback = this.callbacks.get(response.id);
      if (callback) {
        if (response.error) {
          callback.reject(response.error);
        } else {
          callback.resolve(response.result);
        }
        this.callbacks.delete(response.id);
      }
    });
  }

  get isConnected() {
    return this.socket.readyState === WebSocket.OPEN
  }

  connect(): Promise<void> {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.logger.log('ElectrumWsClient: already connected');
      return;
    }
    return new Promise((resolve, reject) => {
      this.socket.on('open', () => {
        this.logger.log('ElectrumWsClient: Open Event');
        resolve();
      });
      this.socket.on('error', err => {
        this.logger.log('ElectrumWsClient: Failed Event' + err.message);
        reject();
      });
    });
  }

  disconnect(): void {
    this.socket.close();
  }

  send(method: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.log('ElectrumWsClient: Sending');
      const id = uuid()  // ID for JSON-RPC request
      const request = {id, method, params};
      this.callbacks.set(id, {resolve, reject});
      this.socket.send(JSON.stringify(request));
    });
  }
}
