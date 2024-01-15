import { BadRequestException, Injectable } from '@nestjs/common';
import { PublicKeyDto } from '../types/user.types';
import { DbService } from '../db/db.service';
import { isValidRSAPublicKey } from '../crypto/is-valid-rsa-pubic-key';

@Injectable()
export class UserSettingsService {

  constructor(
    private dbService: DbService
  ) {
  }

  async savePublicKey(
    userId: string, publicKey: string
  ): Promise<void> {
    if (!isValidRSAPublicKey(publicKey)) {
      throw new BadRequestException('Public Key is not a valid RSA Public Key');
    }
    const base64 = Buffer.from(publicKey).toString('base64');
    await this.dbService.users.update(userId, {publicKey: base64});
  }

  async getPublicKey(
    userId: string
  ): Promise<PublicKeyDto> {
    const user = await this.dbService.users.get(userId);
    const publicKey = Buffer.from(user.publicKey, 'base64').toString('ascii');
    return {publicKey};
  }
}
