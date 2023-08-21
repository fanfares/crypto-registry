import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({scope: Scope.TRANSIENT})
export class NullLoggerService implements LoggerService {

  error(message: any, context?: string) {
  }

  debug(message: any, context?: string) {
  }

  log(message: any, context?: string) {
  }

  warn(message: any, context?: string) {
  }

}
