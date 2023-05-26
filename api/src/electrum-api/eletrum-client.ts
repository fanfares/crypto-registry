import {io, Socket } from 'socket.io-client';

export class ElectrumClient {
  private socket: Socket;

  constructor(url: string) {
    this.socket = io(url, {
      transports: ['websocket']
    });
  }

  connect(): Promise<void> {
    return new Promise(
      (resolve, reject) => {
        this.socket.on('connect', resolve);
        this.socket.on('connect_error', reject);
      });
  }

  disconnect(): void {
    this.socket.disconnect();
  }

  send(method: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = Math.floor(Math.random() * 1000);  // Random ID for JSON-RPC request

      this.socket.emit('blockchain.transaction.get', {id, method, params}, (response: any) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve(response.result);
        }
      });
    });
  }
}
