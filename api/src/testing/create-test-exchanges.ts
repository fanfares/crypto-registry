import { DbService } from '../db/db.service';
import { ExchangeBase, ExchangeStatus, UserBase } from '@bcr/types';
import { PasswordHasher } from '../auth/password-hasher';

export async function createTestExchanges(
  numberOfExchanges: number,
  db: DbService
) {
  const exchangeInserts: ExchangeBase[] = [];
  for (let i = 0; i < numberOfExchanges; i++) {
    exchangeInserts.push({
      name: 'Exchange ' + i,
      status: ExchangeStatus.AWAITING_DATA
    });
  }
  await db.exchanges.insertMany(exchangeInserts);

  const users: UserBase[] = [];
  const exchanges = await db.exchanges.find({});

  if (exchanges.length > 0) {
    await db.users.updateMany({}, {
      exchangeId: exchanges[0]._id
    });
  }

  const passwordHash = await PasswordHasher.hash('password');
  for (const exchange of exchanges) {
    users.push({
      email: 'admin@' + exchange.name + '.com',
      exchangeId: exchange._id,
      isSystemAdmin: false,
      isVerified: true,
      passwordHash: passwordHash,
      lastSignIn: new Date()
    });
  }

  await db.users.insertMany(users);
}
