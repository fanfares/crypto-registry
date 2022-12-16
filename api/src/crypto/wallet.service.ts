import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class WalletService {
  abstract sendFunds(senderZpub: string, toAddress: string, amount: number): Promise<void>;

  abstract getReceivingAddress(receiverZpub: string, receiverName: string): Promise<string>;
}
