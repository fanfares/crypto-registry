import { BitcoinService, Transaction } from './bitcoin.service';
import { MockAddressDbService } from './mock-address-db.service';
import { Injectable } from '@nestjs/common';


@Injectable()
export class MockBitcoinService extends BitcoinService {
  constructor(private addressDbService: MockAddressDbService) {
    super();
  }

  async getAddressBalance(address: string): Promise<number> {
    const addressData = await this.addressDbService.findOne({
      address: address,
      unspent: true
    });
    return addressData?.balance ?? 0;
  }

  getTransaction(txid: string): Promise<Transaction> { // eslint-disable-line
    return Promise.resolve(undefined);
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> { // eslint-disable-line
    // const addressRecord = await this.addressDbService.findOne({ address });
    return [{
      // inputValue: addressRecord.sendingAddressBalance
    } as Transaction];
  }
}
