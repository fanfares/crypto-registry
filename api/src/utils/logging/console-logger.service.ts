import { ConsoleLogger, LogLevel } from '@nestjs/common';
import { ApiConfigService } from '../../api-config';

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

  logAt(logLevel: string, message: string, ...optionalParams: any[]) {
    switch (logLevel) {
      case 'info':
        if (optionalParams.length > 0) {
          super.log(message + ' ' + JSON.stringify(optionalParams[0], null, 2));
        } else {
          super.log(message);
        }
        break;
      case 'warn':
        if (optionalParams.length > 0) {
          super.warn(message + ' ' + JSON.stringify(optionalParams[0], null, 2));
        } else {
          super.warn(message);
        }
        break;
      case 'debug':
        if (optionalParams.length > 0) {
          super.debug(message + ' ' + JSON.stringify(optionalParams[0], null, 2));
        } else {
          super.debug(message);
        }
        break;
      case 'error':
        if (optionalParams.length > 0) {
          super.error(message + ' ' + JSON.stringify(optionalParams[0], null, 2));
        } else {
          super.error(message);
        }
        break;
      default:
        super.log(message, ...optionalParams);
        break;
    }
  }

  logWithContext(level: string, message: any, ...optionalParams: any[]) {
    let context = 'No Context';
    if (optionalParams.length > 0) {
      const lastParam = optionalParams[optionalParams.length - 1];
      if (typeof lastParam === 'string') {
        context = lastParam;
        optionalParams.pop();
      }
    }

    if (optionalParams.length > 0) {
      this.logAt(level, `[${context}] ${message}`, ...optionalParams);
    } else {
      this.logAt(level, `[${context}] ${message}`);
    }
  }

  log(message: any, ...optionalParams: any[]) {
    this.logWithContext('info', message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logWithContext('debug', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logWithContext('error', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logWithContext('warn', message, ...optionalParams);
  }
}
