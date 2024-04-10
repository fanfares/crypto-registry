import { ApiConfigService } from '../../api-config';
import { AwsLoggerService } from './aws-logger-service';
import { GcpLoggingService } from './gcp-logging-service';
import { ConsoleLoggerService } from './console-logger.service';
import { NullLoggerService } from './null-logger.service';
import { LoggerService } from '@nestjs/common';

export const loggerFactory = {
  create: (configService: ApiConfigService): LoggerService => {
    if (configService.loggerService === 'aws') {
      return new AwsLoggerService(configService, 'server-events');
    } else if (configService.loggerService === 'gcp') {
      return new GcpLoggingService(configService);
    } else if (configService.loggerService === 'null') {
      return new NullLoggerService();
    } else {
      return new ConsoleLoggerService(configService);
    }
  }
};
