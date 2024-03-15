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

    this.socket.on('error', err => {
      console.error('Websocket Error');
      console.error(err);
    })

    this.socket.on('ping', () => {
      this.logger.debug('electrum-ws-client: Ping Event');
    });

    this.socket.on('pong', () => {
      this.logger.debug('electrum-ws-client: Pong Event');
    });

    this.socket.on('unexpected-response', () => {
      this.logger.error('electrum-ws-client: Unexpected Response Event');
    });

    this.socket.on('message', (message: string) => {
      this.logger.debug('electrum-ws-client: message event' + message);
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
        this.logger.error('electrum-ws-client: no callback for id ' + response.id);
      }
    });
  }

  get isConnected() {
    return this.socket.readyState === WebSocket.OPEN;
  }

  connect(): Promise<void> {
    if (this.socket.readyState === WebSocket.OPEN) {
      return;
    }
    this.logger.debug('electrum-ws-client: connecting');
    return new Promise((resolve, reject) => {
      this.socket.on('open', () => {
        this.logger.log('electrum-ws-client: open event');
        resolve();
      });
      this.socket.on('close', () => {
        this.logger.log('electrum-ws-client: close event');
        reject();
      });

      this.socket.on('error', err => {
        this.logger.error('electrum-ws-client: failed event' + err.message);
        reject(err);
      });
    });
  }

  disconnect(): void {
    this.socket.close();
  }

  send(method: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.debug('electrum-ws-client: sending', {method, params});
      const id = uuid();  // ID for JSON-RPC request
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
    this.logger.log('Check ElectrumX Service');
    const expiredCallbacks = Array.from(this.callbacks.values()).filter(callback => {
      return callback.createdAt.getTime() < Date.now() - 10000;
    });
    if (expiredCallbacks.length > 0) {
      this.logger.error('electrum-ws-client: callbacks not empty', {expiredCallbacks});
      for (const expiredCallback of expiredCallbacks) {
        this.callbacks.delete(expiredCallback.id);
        expiredCallback.reject('Timeout');
      }
    } else {
      this.logger.log('electrum-ws-client: No expired callbacks');
    }
  }
}
