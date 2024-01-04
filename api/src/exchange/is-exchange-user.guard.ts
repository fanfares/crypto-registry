import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRecord } from '../types/user.types';

@Injectable()
export class IsExchangeUserGuard implements CanActivate {
  constructor() {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.getArgByIndex(0);
    const user: UserRecord = request['user'];
    if (!user) {
      return false;
    }

    if (user.isSystemAdmin) {
      return true;
    }

    const exchangeId = request.params.exchangeId || request.body.exchangeId;
    if (!exchangeId) {
      return false;
    }
    return user.exchangeId = exchangeId;
  }
}
