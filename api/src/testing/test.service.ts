import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { UserService } from '../user';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class TestService {
  constructor(
    private db: DbService,
    private userService: UserService,
    private exchangeService: ExchangeService
  ) {
  }

  async resetDb() {

    const robEmail = 'rob@excal.tv';
    const robUser = await this.db.users.findOne({
      email: robEmail
    });

    const siEmail = 's.smith@niche-invest.com';
    const siUser = await this.db.users.findOne({
      email: siEmail
    });

    await this.db.reset();

    const siExchange = await this.exchangeService.createExchange('Si\'s Test Exchange');
    const robExchange = await this.exchangeService.createExchange('Rob\'s Test Exchange');

    const robsPublicKeyBase64 = 'LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJDZ0tDQVFFQXBGcU9wcTI1R3lzY1QxeS9jQ0tEOFNCN2tQWkYyNGdKUXkxNFNlVTMyQ3ZWTUxsa3F2Y0gKQ3BYY2xmbnNETXE0THBUaHcvMWZtNllDeW96a09xMWhYTHAzdmVxU3BJQW1ZeTc3OGMzSHhsSEE5V3dvRWNBaQp0Z0g4K0NLeXB1cWExWmY0YVdoZkxQQ3RsTW1MOWRHZFY4Y0pMWW0rRFBWWHlxSHJrRmhGL09aRnJBTHBCOHRoCk5wVjBMWHlqZW9EQmVzMEI4WDgwalYxVFJHN0ptZ3FVUTFJS0lBRS9zUE1iQVc4bUZWcmxjQWllQ2NZYzR6TjYKTmVrUlhDQk1WMHdXQmhRRUlESExSUXUyVXJsODRKaUlmWldSd253eU93ZHdZYzEwbG5JVWZNaGtRM3VjRkpJUQo2ejIyUFJHMTZhYkdJUllXUkxyczNEWHcydE9OM0RuRWd3SURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K';

    await this.userService.createUser({
      email: robEmail,
      exchangeId: robExchange._id,
      isSystemAdmin: true,
      isVerified: true,
      passwordHash: robUser?.passwordHash ?? null,
      publicKey: robsPublicKeyBase64
    }, robUser?._id );

    await this.userService.createUser({
      email: siEmail,
      exchangeId: siExchange._id,
      isSystemAdmin: true,
      isVerified: true,
      passwordHash: siUser?.passwordHash ?? null
    }, siUser?._id);
  }
}
