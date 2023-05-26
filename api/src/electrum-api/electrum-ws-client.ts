import WebSocket from 'ws';

export class ElectrumWsClient {
  private socket: WebSocket;
  private url: string;

  constructor(url: string) {
    this.url = url;
    this.socket = new WebSocket(url);
  }

  connect(): Promise<void> {
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
      const id = Math.floor(Math.random() * 1000);  // Random ID for JSON-RPC request
      const request = {id, method, params};

      this.socket.on('message', (message: string) => {
        const response = JSON.parse(message);
        if (response.id === id) {
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.result);
          }
        }
      });

      this.socket.send(JSON.stringify(request));
    });
  }
}
