import * as net from 'net';
import { Socket } from 'net';

export class ElectrumTcpClient {
  private socket: Socket;
  private requestId: number = 0;
  private responseHandlers: Map<number, (value: any) => void> = new Map();

  constructor(private host: string, private port: number) {
    this.socket = new net.Socket();
    this.socket.on('data', this.handleResponse.bind(this));
  }

  private handleResponse(data: Buffer) {
    const response = JSON.parse(data.toString());
    const resolve = this.responseHandlers.get(response.id);
    if (resolve) {
      resolve(response);
      this.responseHandlers.delete(response.id);
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket.connect(this.port, this.host, () => {
        console.log('Connected to ElectrumX server.');
        resolve();
      });

      this.socket.on('error', (err) => {
        console.error('Connection error:', err);
        reject(err);
      });
    });
  }

  send(method: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = this.requestId++;
      this.responseHandlers.set(requestId, resolve);

      const request = {
        id: requestId,
        method: method,
        params: params,
      };

      const requestData = JSON.stringify(request) + '\n';
      this.socket.write(requestData, 'utf-8', (err) => {
        if (err) {
          reject(err);
        }
      });
    });
  }

  close() {
    this.socket.end();
    console.log('Connection closed.');
  }
}

