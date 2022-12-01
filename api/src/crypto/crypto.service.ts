import { Injectable } from '@nestjs/common';
import { ApiConfigService } from '../api-config/api-config.service';
import { Transaction } from '../types/transaction.type';

@Injectable()
export abstract class CryptoService {
  public constructor(private apiConfig: ApiConfigService) {}

  abstract getBalance(key: string): Promise<number>;

  abstract getTransactions(fromKey: string, toKey: string): Promise<Transaction[]>;

  getTransactionTotal(txs: Transaction[]): number {
    return txs.reduce((txTotal, tx) => {
      return txTotal + tx.amount;
    }, 0);
  }

  async isPaymentMade(exchangeKey: string): Promise<boolean> {
    const txs = await this.getTransactions(exchangeKey, this.apiConfig.registryKey)
    const transactionAmount = this.getTransactionTotal(txs);
    return transactionAmount >= this.apiConfig.registrationCost;
  }
}
