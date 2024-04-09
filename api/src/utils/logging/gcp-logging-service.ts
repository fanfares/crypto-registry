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

    const loggingWinston = new LoggingWinston({
      level: this.apiConfigService.logLevel
    });

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

  log(message: string, info?: any) {
    this.logAt('info', message, info);
  }

  debug(message: string, info?: any) {
    this.logAt('debug', message, info);
  }

  error(message: string, info?: any) {
    this.logAt('error', message, info);
  }

  warn(message: string, info: any) {
    this.logAt('warn', message, info);
  }

}
