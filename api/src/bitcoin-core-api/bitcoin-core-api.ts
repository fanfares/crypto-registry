import fs from "fs";
import https from "https";
import axios from "axios";
import * as path from 'path';
import os from 'os';
import { BitcoinCoreConfig } from "./bitcoin-core-config";

export class BitCoinCoreApi {

  constructor(
    private config: BitcoinCoreConfig
  ) {
  }

  async execute(
    request: BitcoinCoreRequest,
    walletName?: string,
  ): Promise<any> {

    const caCrt = fs.readFileSync(path.join(os.homedir(), '.certs', 'bitcoin.crt'));
    const httpsAgent = new https.Agent({ca: caCrt});
    const url = walletName ? `${this.config.baseUrl}/wallet/${walletName}` : this.config.baseUrl;
    const headers = {'Content-Type': 'application/json'};
    const data = {
      ...request,
      jsonrpc: '2.0',
      id: 'bitcoin-core-api',
      params: request.params || [],
    }

    const response = await axios.post(url, data, {
      headers: headers,
      httpsAgent,
      auth: {
        username: this.config.username,
        password: this.config.password,
      },
    });

    return response.data.result;
  }
}

export interface BitcoinCoreRequest {
  method: string,
  params?: any[],
}
