import * as tls from 'tls';
import { TLSSocket } from 'tls';
import * as fs from 'fs';

export class ElectrumTcpClient {
  private socket: TLSSocket;
  private requestId: number = 0;
  private responseHandlers: Map<number, (value: any) => void> = new Map();
  private readonly cert: string;

  constructor(
    private url: string,
    certPath: string
  ) {
    this.cert = fs.readFileSync(certPath).toString();
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
      const parts = this.url.split(':')
      const host = parts[0];
      const port = Number.parseInt(parts[1]);

      this.socket = tls.connect(port, host, {
        ca: [this.cert],
        rejectUnauthorized: true
      }, () => {
        console.log('Connected to ElectrumX server.');
        resolve();
      });

      this.socket.on('data', this.handleResponse.bind(this));

      this.socket.on('error', (err) => {
        console.error('Connection error:', err);
        reject(err);
      });

      this.socket.on('end', () => {
        console.log('Disconnected from the server');
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
        params: params
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

