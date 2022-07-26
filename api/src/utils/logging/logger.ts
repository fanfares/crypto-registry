import * as winston from 'winston';

export type LoggerLevel = 'error' | 'debug' | 'info' | 'warn';

class BcrLogger {

  constructor(private _logger: winston.Logger = winston.createLogger()) {
    _logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }

  log(level: LoggerLevel, message: string, info?: any) {
    this._logger.log(level, message, info);
  }

  info(message: string, info?: any) {
    this.log('info', message, info);
  }

  debug(message: string, info?: any) {
    this.log('debug', message, info);
  }

  error(err: Error, info?: any) {
    this.log('error', err.message, {...info, err});
  }

  warn(message: string, info?: any) {
    this.log('warn', message, info);
  }

  add(transport: any) {
    this._logger.add(transport);
  }

}

// Logger is created on initialisation code
const logger = new BcrLogger();

export default logger;
