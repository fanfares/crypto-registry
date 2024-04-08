import { ConsoleLogger, Injectable, LoggerService, LogLevel, Scope } from '@nestjs/common';
import { ApiConfigService } from '../../api-config';

@Injectable({scope: Scope.TRANSIENT})
export class ConsoleLoggerService implements LoggerService {

  private consoleLogger = new ConsoleLogger();

  constructor(private apiConfigService: ApiConfigService) {
    const isDebug = this.apiConfigService.logLevel === 'debug';
    const logLevels: LogLevel[] = ['log', 'warn', 'error'];
    if (isDebug) {
      logLevels.push('debug');
      logLevels.push('verbose');
    }
    this.consoleLogger.setLogLevels(logLevels);
  }

  error(message: any, context?: any[]) {
    if (context) {
      this.consoleLogger.error(message, JSON.stringify(context));
    } else {
      this.consoleLogger.error(message);
    }
  }

  debug(message: any, context?: string) {
    if (context) {
      this.consoleLogger.debug(message, context);
    } else {
      this.consoleLogger.debug(message);
    }
  }

  log(message: any, context?: string) {
    if (context) {
      this.consoleLogger.log(message, context);
    } else {
      this.consoleLogger.log(message);
    }
  }

  warn(message: any, context?: string) {
    if (context) {
      this.consoleLogger.warn(message, context);
    } else {
      this.consoleLogger.warn(message);
    }
  }

  verbose(message: any, context?: string) {
    if (context) {
      this.consoleLogger.verbose(message, context);
    } else {
      this.consoleLogger.verbose(message);
    }
  }
}
