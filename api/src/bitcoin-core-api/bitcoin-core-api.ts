import fs from 'fs';
import https from 'https';
import axios, { AxiosError } from 'axios';
import * as path from 'path';
import { BitcoinCoreBlock, BitcoinCoreRequest } from '../types';
import { BitcoinCoreConfig } from './bitcoin-core-config';
import { fromUnixTime } from 'date-fns';
import axiosRetry from 'axios-retry';
import { Logger } from '@nestjs/common';

export interface BitCoinCoreError {
  error?: {
    code: number;
    message: string;
  }
}

export class BitCoinCoreApi {

  private logger = new Logger(BitCoinCoreApi.name);

  constructor(
    private config: BitcoinCoreConfig
  ) {
  }

  async execute(
    request: BitcoinCoreRequest,
    walletName?: string
  ): Promise<any> {

    const caCrt = fs.readFileSync(path.join(process.cwd(), '.certs', this.config.crtFileName));
    const httpsAgent = new https.Agent({ca: caCrt});
    const url = walletName ? `${this.config.baseUrl}/wallet/${walletName}` : this.config.baseUrl;
    const headers = {'Content-Type': 'application/json'};
    const data = {
      ...request,
      jsonrpc: '2.0',
      id: 'bitcoin-core-api',
      params: request.params || []
    };

    const axiosInstance = axios.create({
      headers: headers,
      httpsAgent,
      auth: {
        username: this.config.username,
        password: this.config.password
      }
    });

    axiosRetry(axiosInstance, {
      retryDelay: axiosRetry.exponentialDelay,
      retries: 10,
      retryCondition: (error: AxiosError<BitCoinCoreError>) => {
        if ( !error.response ) {
          return false;
        }
        // Code 28 is the error sent when the BitCoin Service is
        if ( error.response?.data?.error?.code === -28) { // todo - add comment
          return true;
        }
        if ( error.response?.data?.error?.message ) {
          return false
        }
        return false
      }
    });

    try {
      const response = await axiosInstance.post(url, data);
      return response.data.result;
    } catch ( err ) {
      if ( err instanceof AxiosError ) {
        let message = 'Bitcoin Core Api Failed'
        if ( err.response?.data ) {
          message = err.response.data.error?.message;
        } else if ( err.message ) {
          message = err.message
        }
        this.logger.error(message)
        throw new Error(message)
      } else {
        throw err;
      }
    }
  }

  async getBlockDetail(blockHash: string): Promise<BitcoinCoreBlock> {
    const rawDetail = await this.execute({
      method: 'getblock',
      params: [blockHash]
    });

    return {
      ...rawDetail,
      time: fromUnixTime(rawDetail.time)
    };
  }

  async getBestBlockHash() {
    return this.execute({
      method: 'getbestblockhash'
    });
  }
}
