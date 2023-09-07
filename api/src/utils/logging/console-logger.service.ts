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

  error(message: any, context?: string) {
    if (context) {
      this.consoleLogger.error(`${this.apiConfigService.nodeName}: ${message}`, context);
    } else {
      this.consoleLogger.error(`${this.apiConfigService.nodeName}: ${message}`);
    }
  }

  debug(message: any, context?: string) {
    if (context) {
      this.consoleLogger.debug(`${this.apiConfigService.nodeName}: ${message}`, context);
    } else {
      this.consoleLogger.debug(`${this.apiConfigService.nodeName}: ${message}`);
    }
  }

  log(message: any, context?: string) {
    if (context) {
      this.consoleLogger.log(`${this.apiConfigService.nodeName}: ${message}`, context);
    } else {
      this.consoleLogger.log(`${this.apiConfigService.nodeName}: ${message}`);
    }
  }

  warn(message: any, context?: string) {
    if (context) {
      this.consoleLogger.warn(`${this.apiConfigService.nodeName}: ${message}`, context);
    } else {
      this.consoleLogger.warn(`${this.apiConfigService.nodeName}: ${message}`);
    }
  }

  verbose(message: any, context?: string) {
    // your verbose implementation
  }
}
