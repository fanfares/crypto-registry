import fs from "fs";
import https from "https";
import axios from "axios";
import * as path from 'path';
import { BitcoinCoreBlock, BitcoinCoreRawRequest } from '../types';
import { BitcoinCoreConfig } from './bitcoin-core-config';
import { fromUnixTime } from 'date-fns';

export class BitCoinCoreApi {

  constructor(
    private config: BitcoinCoreConfig
  ) {
  }

  async execute(
    request: BitcoinCoreRawRequest,
    walletName?: string,
  ): Promise<any> {

    const caCrt = fs.readFileSync(path.join(process.cwd(), '.certs', this.config.crtFileName));
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

  async getBlockDetail(blockHash: string): Promise<BitcoinCoreBlock> {
    const rawDetail = await this.execute({
      method: 'getblock',
      params: [blockHash]
    })

    return {
      ...rawDetail,
      time: fromUnixTime(rawDetail.time)
    }
  }

  async getBestBlockHash() {
    return this.execute({
      method: 'getbestblockhash'
    });
  }
}
