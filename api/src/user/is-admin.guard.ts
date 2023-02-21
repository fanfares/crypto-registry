import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from './user.service';
import { ADMIN_EMAILS } from './admin-emails';

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(
    private userService: UserService
  ) {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.getArgByIndex(0);
    const idToken = request.header('Authorization')?.replace('Bearer ', '');
    if (!idToken) {
      return false;
    }
    const refreshToken = request.cookies['refresh-token'];
    if (!refreshToken) {
      return false;
    }
    const user = await this.userService.getUserByToken(idToken);
    return ADMIN_EMAILS.includes(user.email);
  }
}
