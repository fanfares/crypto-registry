import { ConsoleLogger, Logger, LoggerService } from '@nestjs/common';

export class TestLoggerService extends Logger implements LoggerService {

  private consoleLogger = new ConsoleLogger();

  constructor(debug?: boolean) {
    super()
    if ( debug ) {
      this.consoleLogger.setLogLevels(['debug']);
    } else {
      this.consoleLogger.setLogLevels(['log']);
    }
  }

  error(message: any, context?: string) {
    if (context) {
      this.consoleLogger.error(`Logger${message}`, context);
    } else {
      this.consoleLogger.error(`Logger${message}`);
    }
  }

  debug(message: any, context?: string) {
    if (context) {
      this.consoleLogger.debug(`Logger${message}`, context);
    } else {
      this.consoleLogger.debug(`Logger${message}`);
    }
  }

  log(message: any, context?: string) {
    if (context) {
      this.consoleLogger.log(`Logger${message}`, context);
    } else {
      this.consoleLogger.log(`Logger${message}`);
    }
  }

  warn(message: any, context?: string) {
    if (context) {
      this.consoleLogger.warn(`Logger${message}`, context);
    } else {
      this.consoleLogger.warn(`Logger${message}`);
    }
  }

  verbose(message: any, context?: string) {
    // your verbose implementation
  }

}
