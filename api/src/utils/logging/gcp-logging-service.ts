import { requestContext } from './request-context';
import * as winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { LoggerService } from '@nestjs/common';
import { ApiConfigService } from '../../api-config';

export class GcpLoggingService implements LoggerService {
  private _logger: winston.Logger;

  constructor(
    private apiConfigService: ApiConfigService
  ) {
    requestContext.init();

    const loggingWinston = new LoggingWinston();

    this._logger = winston.createLogger({
      level: this.apiConfigService.logLevel,
      transports: [
        loggingWinston
      ]
    });
  }

  private logAt(logLevel: string, message: string, info?: any) {
    const context = requestContext.getRequestContext();
    if (context) {
      const traceId = context.split('/')[0];
      const projectId = this.apiConfigService.gcpProjectId;

      if (info) {
        if (typeof info === 'string') {
          this._logger.log(logLevel, message, {
            [LoggingWinston.LOGGING_TRACE_KEY]: `projects/${projectId}/traces/${traceId}`,
            info: info
          });
        } else {
          this._logger.log(logLevel, message, {
            [LoggingWinston.LOGGING_TRACE_KEY]: `projects/${projectId}/traces/${traceId}`,
            ...info
          });
        }
      } else {
        this._logger.log(logLevel, message, {
          [LoggingWinston.LOGGING_TRACE_KEY]: `projects/${projectId}/traces/${traceId}`
        });
      }
    } else {
      if (info) {
        if (typeof info === 'string') {
          this._logger.log(logLevel, message, {info: info});
        } else {
          this._logger.log(logLevel, message, info);
        }
      } else {
        this._logger.log(logLevel, message);
      }
    }
  }

  logWithContext(level: string, message: any, ...optionalParams: any[]) {
    let context= 'No Context';
    if (optionalParams.length > 0) {
      const lastParam = optionalParams[optionalParams.length - 1];
      if (typeof lastParam === 'string') {
        context = lastParam;
        optionalParams.pop();
      }
    }

    if (optionalParams.length > 0) {
      this.logAt(level, `[${context}] ${message}`, optionalParams);
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
