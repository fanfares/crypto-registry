import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class IsAuthenticatedGuard implements CanActivate {
  constructor() {
  }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context.getArgByIndex(0);
    const user = request['user'];
    return !!user;
  }
}
