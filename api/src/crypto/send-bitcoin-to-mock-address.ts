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
  console.log({ address: fromAddress })
  const fromAddressData = await mockAddressDb.findOne({ address: fromAddress });
  if (fromAddressData && fromAddressData.balance >= amount) {
    await mockAddressDb.update(
      fromAddressData._id,
      {
        balance: fromAddressData.balance - amount
      },
      identity
    );
  } else {
    throw new BadRequestException('Insufficient funds');
  }

  const toAddressData = await mockAddressDb.findOne({ address: toAddress });
  if (toAddressData) {
    await mockAddressDb.update(
      fromAddressData._id,
      {
        balance: toAddressData.balance + amount
      },
      identity
    );
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
