import { BitcoinService, Transaction } from './bitcoin.service';
import { MockAddressDbService } from './mock-address-db.service';
import { Injectable, BadRequestException } from '@nestjs/common';
import { UserIdentity } from '@bcr/types';


@Injectable()
export class MockBitcoinService extends BitcoinService {
  constructor(private mockAddressDbService: MockAddressDbService) {
    super();
  }

  async getBalance(address: string): Promise<number> {
    const addressData = await this.mockAddressDbService.findOne({ address });
    return addressData?.balance ?? 0;
  }

  getTransaction(txid: string): Promise<Transaction> { // eslint-disable-line
    return Promise.resolve(undefined);
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> {
    const addressRecord = await this.mockAddressDbService.findOne({ address });
    return [{
      inputValue: addressRecord.sendingAddressBalance
    } as Transaction];
  }

  async sendFunds(fromAddress: string,
                  toAddress: string,
                  amount: number) {
    const identity: UserIdentity = { type: 'test' };
    const fromAddressRecord = await this.mockAddressDbService.findOne({ address: fromAddress });
    if (fromAddressRecord && fromAddressRecord.balance >= amount) {
      await this.mockAddressDbService.update(fromAddressRecord._id, {
        balance: fromAddressRecord.balance - amount
      }, identity);
    } else {
      throw new BadRequestException('Insufficient funds');
    }

    const toAddressRecord = await this.mockAddressDbService.findOne({ address: toAddress });
    if (toAddressRecord) {
      await this.mockAddressDbService.update(toAddressRecord._id, {
        balance: toAddressRecord.balance + amount
      }, identity);

    } else {
      await this.mockAddressDbService.insert({
        balance: amount,
        address: toAddress,
        sendingAddressBalance: fromAddressRecord.balance
      }, identity);
    }
  }
}
