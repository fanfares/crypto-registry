import { BitcoinService } from './bitcoin.service';
import { MongoService } from '../db';
import { MockAddressDbService } from './mock-address-db.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MockBitcoinService extends BitcoinService {
  constructor(private mongoService: MongoService) {
    super();
  }

  async getBalance(address: string): Promise<number> {
    const mockAddressDb = new MockAddressDbService(this.mongoService);
    const addressData = await mockAddressDb.findOne({ address });
    return addressData?.balance ?? 0;
  }
}
