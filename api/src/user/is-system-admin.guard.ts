import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRecord } from '../types/user.types';

@Injectable()
export class IsSystemAdminGuard implements CanActivate {
  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.getArgByIndex(0);
    const user: UserRecord = request['user'];
    return user.isSystemAdmin;
  }
}
