import { ElectrumRequest } from './electrum-client';

export interface ElectrumClientInterface {
  connect(): Promise<void>;

  disconnect(): void;

  sendMultiple(
    requests: ElectrumRequest[],
    timeout
  ): Promise<any[]>;

  send(
    method: string,
    params: any[],
    timeout
  ): Promise<any>;
}
