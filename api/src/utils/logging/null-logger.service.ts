import { Injectable, LoggerService, Scope } from '@nestjs/common';

@Injectable({scope: Scope.TRANSIENT})
export class NullLoggerService implements LoggerService {

  error() {
    //
  }

  debug() {
    //
  }

  log() {
    //
  }

  warn() {
    //
  }

}
