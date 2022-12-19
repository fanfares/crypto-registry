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

  getTransaction(txid: string): Promise<Transaction> {
    return this.addressDbService.transactions.findOne({ txid });
  }

  async getTransactionsForAddress(address: string): Promise<Transaction[]> { // eslint-disable-line
    const txs = await this.addressDbService.transactions.find({});
    return txs.filter(tx => {
      const inSide = tx.inputs.filter(input => input.address === address);
      if (inSide.length > 0) {
        return true;
      }
      const outSide = tx.outputs.filter(input => input.address === address);
      if (outSide.length) {
        return true;
      }
    });
  }
}
