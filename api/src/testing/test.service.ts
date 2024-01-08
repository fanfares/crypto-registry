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

    const siExchangeId = await this.exchangeService.createExchange('Si\'s Test Exchange');
    const robExchangeId = await this.exchangeService.createExchange('Rob\'s Test Exchange');

    await this.userService.createUser({
      email: robEmail,
      exchangeId: robExchangeId,
      isSystemAdmin: true,
      isVerified: true,
      passwordHash: robUser?.passwordHash ?? null
    }, robUser?._id );

    await this.userService.createUser({
      email: siEmail,
      exchangeId: siExchangeId,
      isSystemAdmin: true,
      isVerified: true,
      passwordHash: siUser?.passwordHash ?? null
    }, siUser?._id);
  }
}
