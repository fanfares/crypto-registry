import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserService } from './user.service';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
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

  if ( user ) {
    request['user'] = user
  }

    return !!user;
  }
}
