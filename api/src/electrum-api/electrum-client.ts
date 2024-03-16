import { v4 as uuid } from 'uuid';
import WebSocket from 'ws';
import { Logger } from '@nestjs/common';
import { addressToScriptHash } from './address-to-script-hash';
import { getHash } from '../utils';

export interface Callback {
  id: string;
  createdAt: Date;
  resolve: (value: any) => void,
  reject: (reason: any) => void
}

export class ElectrumClient {
  public socket: WebSocket;
  private callbacks = new Map<string, Callback>();

  constructor(url: string, private logger: Logger) {
    this.socket = new WebSocket(url, {});

    this.socket.on('error', err => {
      console.error('Websocket Error');
      console.error(err);
    });

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

      let callbackId: string;
      if (Array.isArray(response)) {
        callbackId = response.map(r => r.id).sort()[0]
      } else {
        callbackId = response.id;
      }

      const callback = this.callbacks.get(callbackId);
      if (callback) {
        this.callbacks.delete(callbackId);
        if (response.error) {
          callback.reject(response.error);
        } else {
          if ( Array.isArray(response )) {
            callback.resolve(response.map(r => ({ id: r.id, ...r.result })));
          } else {
            callback.resolve(response.result);
          }
        }
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

  async getAddressBalances(
    addresses: string[]
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if ( addresses.length === 0 ) {
        reject('No addresses')
      }

      let requests: any[] = []
      for (let i = 0; i < addresses.length; i++) {
        requests.push({
          id: addresses[i],
          method: 'blockchain.scripthash.get_balance',
          params: [addressToScriptHash(addresses[i])],
        })
      }

      const id  = addresses.sort()[0];

      this.callbacks.set(id, {
        id,
        createdAt: new Date(),
        resolve,
        reject
      });
      this.socket.send(JSON.stringify(requests), {});
    });
  }

  send(method: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.logger.debug('electrum-ws-client: sending', {method, params});
      const id = uuid();  // ID for JSON-RPC request
      const request = {id, method, params};
      this.callbacks.set(id, {
        id,
        createdAt: new Date(),
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