import {Injectable} from '@nestjs/common';

@Injectable()
export abstract class WalletService {
  abstract sendFunds(
    senderZpub: string,
    toAddress: string,
    amount: number
  ): Promise<void>;

  abstract getReceivingAddress(
    receiverZpub: string,
    receiverName: string
  ): Promise<string>;

  abstract storeReceivingAddress(
    receiverZpub: string,
    receiverName: string,
    receivingAddress: string
  ): Promise<void>

  abstract isUsedAddress(
    address: string
  ): Promise<boolean>

  abstract getAddressCount(
    receiverZpub: string,
  ): Promise<number>

  abstract resetHistory(
    accountZpub: string,
    waitBetweenCalls: boolean
  ): Promise<void>
}
