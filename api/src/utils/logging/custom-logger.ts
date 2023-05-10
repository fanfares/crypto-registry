import { Injectable, Scope, ConsoleLogger, LogLevel } from '@nestjs/common';
import { ApiConfigService } from '../../api-config';

@Injectable({scope: Scope.TRANSIENT})
export class CustomLogger extends ConsoleLogger {

  constructor(private apiConfigService: ApiConfigService) {
    super();
    const isDebug = this.apiConfigService.logLevel === 'debug';
    const logLevels: LogLevel[] = ['log', 'warn', 'error'];
    if (isDebug) {
      logLevels.push('debug');
      logLevels.push('verbose');
    }
    super.setLogLevels(logLevels);
  }

  debug(message: any, context?: string) {
    if ( context ) {
      super.debug(`${this.apiConfigService.nodeAddress}: ${message}`, context);
    } else {
      super.debug(`${this.apiConfigService.nodeAddress}: ${message}`);
    }
  }

  log(message: any, context?: string) {
    if ( context ) {
      super.log(`${this.apiConfigService.nodeAddress}: ${message}`, context);
    } else {
      super.log(`${this.apiConfigService.nodeAddress}: ${message}`);
    }
  }

  warn(message: any, context?: string) {
    if ( context ) {
      super.warn(`${this.apiConfigService.nodeAddress}: ${message}`, context);
    } else {
      super.warn(`${this.apiConfigService.nodeAddress}: ${message}`);
    }
  }

}
