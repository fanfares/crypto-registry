import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {
  sendFunds(
    toAddress: string, // eslint-disable-line
    amount: number // eslint-disable-line
  ): Promise<void> {
    throw new Error('Wallet Service not implemented in production')
  }
}
