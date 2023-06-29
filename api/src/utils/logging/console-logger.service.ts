import { ConsoleLogger, Injectable, LogLevel, Scope } from '@nestjs/common';
import { ApiConfigService } from '../../api-config';

@Injectable({scope: Scope.TRANSIENT})
export class ConsoleLoggerService extends ConsoleLogger {

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

  error(message: any, context?: string) {
    if (context) {
      super.error(`${this.apiConfigService.nodeName}: ${message}`, context);
    } else {
      super.error(`${this.apiConfigService.nodeName}: ${message}`);
    }
  }

  debug(message: any, context?: string) {
    if (context) {
      super.debug(`${this.apiConfigService.nodeName}: ${message}`, context);
    } else {
      super.debug(`${this.apiConfigService.nodeName}: ${message}`);
    }
  }

  log(message: any, context?: string) {
    if (context) {
      super.log(`${this.apiConfigService.nodeName}: ${message}`, context);
    } else {
      super.log(`${this.apiConfigService.nodeName}: ${message}`);
    }
  }

  warn(message: any, context?: string) {
    if (context) {
      super.warn(`${this.apiConfigService.nodeName}: ${message}`, context);
    } else {
      super.warn(`${this.apiConfigService.nodeName}: ${message}`);
    }
  }

}
