import { ElectrumRequest } from './electrum.types';

export interface ElectrumClientInterface {
  connect(): Promise<void>;

  disconnect(): void;

  sendMultiple(
    requests: ElectrumRequest[],
    timeout?: number
  ): Promise<any[]>;

  send(
    method: string,
    params: any[],
    timeout?: number
  ): Promise<any>;
}
