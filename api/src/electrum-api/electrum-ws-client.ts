import { v4 as uuid } from 'uuid';
import WebSocket from 'ws';
import { Logger } from '@nestjs/common';

export interface Callback {
  id: string;
  createdAt: Date;
  method: string;
  params: any[];
  resolve: (value: any) => void,
  reject: (reason: any) => void
}

export class ElectrumWsClient {
  public socket: WebSocket;
  private callbacks = new Map<string, Callback>();

  constructor(url: string, private logger: Logger) {
    this.socket = new WebSocket(url, {});

    this.socket.on('ping', () => {
      this.logger.log('ElectrumWsClient: Ping Event');
    });

    this.socket.on('pong', () => {
      this.logger.log('ElectrumWsClient: Pong Event');
    });

    this.socket.on('unexpected-response', () => {
      this.logger.log('ElectrumWsClient: Unexpected Response Event');
    });

    this.socket.on('message', (message: string) => {
      this.logger.log('ElectrumWsClient: Message Event' + message);
      const response = JSON.parse(message);
      const callback = this.callbacks.get(response.id);
      if (callback) {
        if (response.error) {
          callback.reject(response.error);
        } else {
          callback.resolve(response.result);
        }
        this.callbacks.delete(response.id);
      } else {
        this.logger.log('ElectrumWsClient: No callback for id ' + response.id);
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
      this.socket.on('close', () => {
        this.logger.log('ElectrumWsClient: Close Event');
        reject();
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
      this.callbacks.set(id, {
        id,
        createdAt: new Date(),
        method,
        params,
        resolve,
        reject
      });
      this.socket.send(JSON.stringify(request), {});
    });
  }

  check() {
    const expiredCallbacks = Array.from(this.callbacks.values()).filter(callback => {
      return callback.createdAt.getTime() < Date.now() - 10000;
    })
    if (expiredCallbacks.length > 0) {
      this.logger.error('ElectrumWsClient: callbacks not empty', {expiredCallbacks} );
      for (const expiredCallback of expiredCallbacks) {
        this.callbacks.delete(expiredCallback.id);
        expiredCallback.reject('Timeout');
      }
    } else {
      this.logger.log('ElectrumWsClient: No expired callbacks');
    }
  }
}
