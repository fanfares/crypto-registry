import { BitcoinService, OutputAddress, Transaction } from './bitcoin.service';
import { DbService } from '../db/db.service';
import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';
import { format } from 'date-fns';
import { getHash } from '../utils';
import { wait } from '../utils/wait';
import { ApiConfigService } from "../api-config";
import { AxiosError } from "axios";

export class MockBitcoinService extends BitcoinService {
  nextRequestStatusCode: number | null = null;

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    logger: Logger
  ) {
    super(logger, Network.testnet);
  }

  setNextRequestStatusCode(code: number) {
    this.nextRequestStatusCode = code;
  }

  private checkNextRequestStatusCode() {
    if (this.nextRequestStatusCode) {
      const code = this.nextRequestStatusCode
      this.nextRequestStatusCode = null;
      throw new AxiosError(`mock ${code} error`, code.toString());
    }
  }

  async getAddressBalance(address: string): Promise<number> {
    this.checkNextRequestStatusCode()

    const addressData = await this.dbService.mockAddresses.findOne({
      address: address,
      unspent: true
    });
    return addressData?.balance ?? 0;
  }

  getTransaction(txid: string): Promise<Transaction> {
    return this.dbService.mockTransactions.findOne({txid});
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> { // eslint-disable-line
    const txs = await this.dbService.mockTransactions.find({});
    return txs.filter(tx => {
      const inSide = tx.inputs.filter(input => input.address === address);
      if (inSide.length > 0) {
        return true;
      }
      const outSide = tx.outputs.filter(input => input.address === address);
      if (outSide.length) {
        return true;
      }
    });
  }

  getLatestBlock(): Promise<string> {
    const dateTime = format(new Date(), 'yyyy-MM-dd:HHmm');
    return Promise.resolve(getHash(dateTime, 'sha256'));
  }

  async getWalletBalance(zpub: string): Promise<number> {
    if (!this.apiConfigService.isTestMode) {
      await wait(7000);
    }
    return super.getWalletBalance(zpub);
  }

  addressHasTransactions(address: string): Promise<boolean> {
    return Promise.resolve(false);
  }

  getPreviousOutputAddress(address: string): Promise<OutputAddress[] | null> {
    return Promise.resolve(undefined);
  }
}
