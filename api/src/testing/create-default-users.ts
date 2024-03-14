import { DbService } from '../db/db.service';
import { PasswordHasher } from '../auth/password-hasher';

export const createDefaultUsers = async (
  db: DbService
) => {

  const adminEmail = 'rob@excal.tv';
  const adminUser = await db.users.findOne({
    email: adminEmail
  });

  const apiKey = 'LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJDZ0tDQVFFQXBGcU9wcTI1R3lzY1QxeS9jQ0tEOFNCN2tQWkYyNGdKUXkxNFNlVTMyQ3ZWTUxsa3F2Y0gKQ3BYY2xmbnNETXE0THBUaHcvMWZtNllDeW96a09xMWhYTHAzdmVxU3BJQW1ZeTc3OGMzSHhsSEE5V3dvRWNBaQp0Z0g4K0NLeXB1cWExWmY0YVdoZkxQQ3RsTW1MOWRHZFY4Y0pMWW0rRFBWWHlxSHJrRmhGL09aRnJBTHBCOHRoCk5wVjBMWHlqZW9EQmVzMEI4WDgwalYxVFJHN0ptZ3FVUTFJS0lBRS9zUE1iQVc4bUZWcmxjQWllQ2NZYzR6TjYKTmVrUlhDQk1WMHdXQmhRRUlESExSUXUyVXJsODRKaUlmWldSd253eU93ZHdZYzEwbG5JVWZNaGtRM3VjRkpJUQo2ejIyUFJHMTZhYkdJUllXUkxyczNEWHcydE9OM0RuRWd3SURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K';
  const passwordHash = await PasswordHasher.hash('password');

  const exchange = await db.exchanges.findOne({})

  if (!adminUser) {
    await db.users.insert({
      email: adminEmail,
      isSystemAdmin: true,
      isVerified: true,
      passwordHash: adminUser?.passwordHash ?? passwordHash,
      publicKey: apiKey,
      exchangeId: exchange._id
    });
  }

  const exchangeUserEmail = 'robert.porter1@gmail.com';
  const exchangeUser = await db.users.findOne({
    email: exchangeUserEmail
  });

  if (!exchangeUser) {
    await db.users.insert({
      email: exchangeUserEmail,
      isSystemAdmin: false,
      isVerified: true,
      passwordHash: adminUser?.passwordHash ?? passwordHash,
      publicKey: apiKey,
      exchangeId: exchange._id
    });
  }
};
