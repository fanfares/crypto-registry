import { DbService } from '../db/db.service';
import { PasswordHasher } from '../auth/password-hasher';
import { testAdminCredentials } from './test-admin-email';

export const createAdminUser = async (
  dbService: DbService
) => {
  const passwordHash = await PasswordHasher.hash(testAdminCredentials.password);

  await dbService.users.insert({
    ...testAdminCredentials,
    isSystemAdmin: true,
    exchangeId: null,
    isVerified: true,
    passwordHash: passwordHash
  });
};
