import { Injectable } from '@nestjs/common';

@Injectable()
export class WalletService {
  sendFunds(
    toAddress: string,
    amount: number
  ): Promise<void> {
    throw new Error('Wallet Service not implemented in production')
  }
}
