import { v4 as uuid } from 'uuid';
import WebSocket from 'ws';

export class ElectrumWsClient {
  public socket: WebSocket;
  private readonly url: string;
  private callbacks: Map<string, {resolve: (value: any) => void, reject: (reason: any) => void}>;

  constructor(url: string) {
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

  connect(): Promise<void> {
    if ( this.socket.readyState === WebSocket.OPEN ) {
      return;
    }
    return new Promise((resolve, reject) => {
      this.socket.on('open', () => {
        console.log('connected to', this.url);
        resolve();
      });
      this.socket.on('error', err => {
        console.log('failed to connect' + err.message);
        reject();
      });
    });
  }

  disconnect(): void {
    this.socket.close();
  }

  send(method: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = uuid()  // ID for JSON-RPC request
      const request = {id, method, params};
      this.callbacks.set(id, {resolve, reject});
      this.socket.send(JSON.stringify(request));
    });
  }
}
