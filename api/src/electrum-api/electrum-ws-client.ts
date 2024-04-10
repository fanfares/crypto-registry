import { v4 as uuid } from 'uuid';
import WebSocket from 'ws';
import { Logger } from '@nestjs/common';
import { getHash } from '../utils';
import { ElectrumClientInterface } from './electrum-client-interface';

interface Callback {
  id: string;
  createdAt: Date;
  resolve: (value: any) => void,
  reject: (reason: any) => void
  timeoutHandle: NodeJS.Timeout;
}

export interface ElectrumRequest {
  id: string;
  method: string;
  params: any[];
}

export class ElectrumWsClient implements ElectrumClientInterface {
  private logger= new Logger(ElectrumWsClient.name);
  public socket: WebSocket;
  private callbacks = new Map<string, Callback>();
  private pingTimeout: NodeJS.Timeout;

  constructor(
    private url: string
  ) {
  }

  private get isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  connect(): Promise<void> {
    this.logger.debug('electrum-client connect socket.readyState=' + this.socket?.readyState);
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.logger.debug('electrum-ws-client: this.socket.readyState === WebSocket.OPEN');
      return;
    }
    this.logger.debug('electrum-ws-client: connecting');

    return new Promise((resolve, reject) => {

      this.socket = new WebSocket(this.url);

      const connectTimeout = setTimeout(() => {
        this.logger.error('electrum-client: timed out on connect:' + this.socket.readyState);
        reject('electrum-ws-client: connection timeout');
      }, 10000);

      this.socket.on('error', err => {
        console.error('Websocket Error');
        console.error(err);
      });

      // this.socket.on('ping', () => {
      //   this.logger.debug('electrum-ws-client: Ping Event');
      //   clearTimeout(this.pingTimeout);
      //
      //   this.pingTimeout = setTimeout(() => {
      //     this.socket.terminate();
      //   }, 30000);
      // });

      this.socket.on('unexpected-response', () => {
        this.logger.error('electrum-ws-client: unexpected-response');
      });

      this.socket.on('message', (message: string) => {
        this.logger.debug('electrum-ws-client: message event' + message);
        const response = JSON.parse(message);

        let callbackId: string;
        if (Array.isArray(response)) {
          callbackId = getHash(response.map(r => r.id).sort().join(), 'sha256');
        } else {
          callbackId = response.id;
        }

        const callback = this.callbacks.get(callbackId);
        if (callback) {
          clearTimeout(callback.timeoutHandle);
          this.callbacks.delete(callbackId);
          if (response.error) {
            callback.reject(response.error);
          } else {
            if (Array.isArray(response)) {
              callback.resolve(response.map(r => ({id: r.id, ...r.result})));
            } else {
              callback.resolve(response.result);
            }
          }
        } else {
          this.logger.error('electrum-ws-client: no callback for id ' + response.id);
        }
      });

      this.socket.on('open', () => {
        clearTimeout(connectTimeout);
        this.logger.log('electrum-ws-client: open event');
        resolve();
      });

      this.socket.on('close', () => {
        clearTimeout(connectTimeout);
        this.logger.log('electrum-ws-client: close event');
        reject();
      });

      this.socket.on('error', err => {
        clearTimeout(connectTimeout);
        this.logger.error('electrum-ws-client: failed event' + err.message);
        reject(err);
      });

    });
  }

  disconnect(): void {
    if (!this.isConnected) {
      this.socket.close();
    }
  }

  async sendMultiple(
    requests: ElectrumRequest[],
    timeout = 10000
  ): Promise<any[]> {
    await this.connect();

    if (requests.length === 0) {
      throw new Error('No requests');
    }

    return new Promise((resolve, reject) => {

      const id = getHash(requests.map(r => r.id).sort().join(), 'sha256');

      const timeoutHandle = setTimeout(() => {
        this.callbacks.delete(id);
        reject(new Error('electrum - get-address-balances - timed out'));
      }, timeout);

      this.callbacks.set(id, {
        id,
        createdAt: new Date(),
        resolve,
        reject,
        timeoutHandle
      });

      this.socket.send(JSON.stringify(requests), {});
    });
  }

  async send(
    method: string,
    params: any[],
    timeout = 10000
  ): Promise<any> {
    await this.connect();
    this.check();
    return new Promise((resolve, reject) => {
      this.logger.debug('electrum-ws-client: sending', {method, params});
      const id = uuid();  // ID for JSON-RPC request
      const request = {id, method, params};

      const timeoutHandle = setTimeout(() => {
        this.callbacks.delete(id);
        reject(new Error('electrum - send - timed out'));
      }, timeout);

      this.callbacks.set(id, {
        id,
        createdAt: new Date(),
        resolve,
        reject,
        timeoutHandle
      });

      this.socket.send(JSON.stringify(request), {});
    });
  }

  check() {
    this.logger.debug('check electrum service for expired callbacks');
    const expiredCallbacks = Array.from(this.callbacks.values()).filter(callback => {
      return callback.createdAt.getTime() < Date.now() - 10000;
    });
    if (expiredCallbacks.length > 0) {
      this.logger.error('electrum-ws-client: callbacks not empty', {expiredCallbacks});
      for (const expiredCallback of expiredCallbacks) {
        this.callbacks.delete(expiredCallback.id);
        expiredCallback.reject('Timeout');
      }
    }
  }
}
