import { MongoService } from '../db/mongo.service';
import { BadRequestException } from '@nestjs/common';
import { MockAddressDbService } from './mock-address-db.service';
import { UserIdentity } from '@bcr/types';

export const sendBitcoinToMockAddress = async (
  mongoService: MongoService,
  fromAddress: string,
  toAddress: string,
  amount: number
) => {
  const identity: UserIdentity = { type: 'test' };
  const mockAddressDb = new MockAddressDbService(mongoService);
  const fromAddressRecord = await mockAddressDb.findOne({ address: fromAddress });
  if (fromAddressRecord && fromAddressRecord.balance >= amount) {
    await mockAddressDb.update(fromAddressRecord._id, {
      balance: fromAddressRecord.balance - amount
    }, identity);
  } else {
    throw new BadRequestException('Insufficient funds');
  }

  const toAddressRecord = await mockAddressDb.findOne({ address: toAddress });
  if (toAddressRecord) {
    await mockAddressDb.update(toAddressRecord._id, {
      balance: toAddressRecord.balance + amount
    }, identity);

  } else {
    await mockAddressDb.insert(
      {
        balance: amount,
        address: toAddress
      },
      identity
    );
  }
};
