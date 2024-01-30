import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { UserRecord } from '@bcr/types';

@Injectable()
export class IsExchangeUserGuard implements CanActivate {
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

    if (!user.exchangeId) {
      throw new ForbiddenException();
    }
  }
}
