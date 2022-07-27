import * as winston from 'winston';
import { LoggerService, Injectable } from '@nestjs/common';


@Injectable()
export class CustomLogger implements LoggerService {

  private _logger: winston.Logger = winston.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });

  log(message: any, ...info: any[]) {
    this._logger.log('info', message, info);
  }

  error(message: any, ...info: any[]) {
    this.log('debug', message, info);
  }

  warn(message: any, ...info: any[]) {
    this.log('warn', message, info);
  }

  debug?(message: any, ...info: any[]) {
    this.log('debug', message, info);
  }

  add(transport: any) {
    this._logger.add(transport);
  }
}
