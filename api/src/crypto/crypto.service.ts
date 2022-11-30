import { Injectable } from '@nestjs/common';
import { ApiConfigService } from '../api-config/api-config.service';

@Injectable()
export abstract class CryptoService {
  public constructor(private apiConfig: ApiConfigService) {}

  abstract getBalance(key: string): Promise<number>;

  abstract getTransaction(fromKey: string, toKey: string): Promise<number>;

  async isPaymentMade(exchangeKey: string): Promise<boolean> {
    const registryKey = this.apiConfig.registryKey;
    const transactionAmount = await this.getTransaction(
      exchangeKey,
      registryKey,
    );
    return transactionAmount >= this.apiConfig.registrationCost;
  }
}
