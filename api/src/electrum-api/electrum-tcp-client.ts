import * as tls from 'tls';
import { TLSSocket } from 'tls';
import * as fs from 'fs';
import { ElectrumClientInterface } from './electrum-client-interface';
import { ElectrumRequest } from './electrum-ws-client';
import { getHash } from '../utils';
import { v4 as uuid } from 'uuid';
import { Logger } from '@nestjs/common';


interface Callback {
  id: string;
  createdAt: Date;
  resolve: (value: any) => void,
  reject: (reason: any) => void
  timeoutHandle: NodeJS.Timeout;
}

export class ElectrumTcpClient implements ElectrumClientInterface {
  private socket: TLSSocket;
  private callbacks = new Map<string, Callback>();
  private readonly cert: string;

  constructor(
    private url: string,
    certPath: string,
    private logger: Logger,
  ) {
    this.cert = fs.readFileSync(certPath).toString();
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

      const requestData = JSON.stringify(requests) + '\n';
      this.socket.write(requestData, 'utf-8', (err) => {
        if (err) {
          reject(err);
        }
      });
    });
  }

  private handleResponse(data: Buffer) {
    const response = JSON.parse(data.toString());
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
  }

  async connect(): Promise<void> {
    if ( this.socket?.readyState === 'open' ) {
      return;
    }

    return new Promise((resolve, reject) => {
      const url = new URL(this.url);
      const host = url.hostname;
      const port = Number.parseInt(url.port);

      this.socket = tls.connect(port, host, {
        ca: [this.cert],
        rejectUnauthorized: true
      }, () => {
        this.logger.log('electrumX-tcp-client: connected');
        resolve();
      });

      this.socket.on('data', this.handleResponse.bind(this));

      this.socket.on('error', (err) => {
        this.logger.error('electrumX-tcp: connection error:', err);
        reject(err);
      });

      this.socket.on('end', () => {
        this.logger.log('electrumX-tcp: disconnected');
      });
    });
  }

  async send(method: string,
       params: any[] = [],
       timeout = 10000
  ): Promise<any> {
    await this.connect();

    return new Promise((resolve, reject) => {
      const id = uuid();

      const request: ElectrumRequest = {
        id: id,
        method: method,
        params: params
      };

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

      const requestData = JSON.stringify(request) + '\n';
      this.socket.write(requestData, 'utf-8', (err) => {
        if (err) {
          reject(err);
        }
      });
    });
  }

  disconnect() {
    if ( this.socket ) {
      this.socket.end();
    }
  }
}

