import { Injectable } from '@nestjs/common';
import { Network } from '@bcr/types';

@Injectable()
export abstract class WalletService {
  abstract sendFunds(
    senderZpub: string,
    toAddress: string,
    amount: number
  ): Promise<void>;

  abstract getReceivingAddress(
    receiverZpub: string,
    receiverName: string,
    network: Network
  ): Promise<string>;

  abstract storeReceivingAddress(
    receiverZpub: string,
    receiverName: string,
    network: Network,
    receivingAddress: string
  ): Promise<void>

  abstract isUsedAddress(
    address: string
  ): Promise<boolean>

  abstract getAddressCount(
    receiverZpub: string,
    network: Network,
  ): Promise<number>
}
