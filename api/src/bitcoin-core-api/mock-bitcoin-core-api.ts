import { BitCoinCoreApi } from './bitcoin-core-api';
import { BitcoinCoreBlock } from '@bcr/types';
import { v4 as uuidv4 } from 'uuid';

export class MockBitcoinCoreApi extends BitCoinCoreApi {
  blockDates = new Map<string, Date>();

  constructor() {
    super(null);
  }

  async getBlockDetail(blockHash: string): Promise<BitcoinCoreBlock> {
    return {
      hash: blockHash,
      time: this.blockDates.get(blockHash)
    } as BitcoinCoreBlock;
  }

  async getBestBlockHash(): Promise<string> {
    const uid = uuidv4();
    this.blockDates.set(uid, new Date());
    return uid;
  }

}
