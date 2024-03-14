import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ApiConfigService } from '../api-config';

@Injectable()
export class IsLocalGuard implements CanActivate {
  constructor(
    private apiConfigService: ApiConfigService
  ) {
  }

  async canActivate(): Promise<boolean> {
    return this.apiConfigService.env === 'local'
  }
}
