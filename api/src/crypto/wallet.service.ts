import { Injectable } from '@nestjs/common';
import { WalletAddress } from "../types/wallet-address-db.types";

@Injectable()
export abstract class WalletService {
  abstract sendFunds(
    senderZpub: string,
    toAddress: string,
    amount: number
  ): Promise<void>;

  abstract getReceivingAddress(
    receiverZpub: string
  ): Promise<WalletAddress>;

  abstract storeReceivingAddress(
    receivingAddress: WalletAddress
  ): Promise<void>

  abstract getAddressCount(
    receiverZpub: string,
  ): Promise<number>

  abstract resetHistory(
    accountZpub: string,
    waitBetweenCalls: boolean
  ): Promise<void>
}
