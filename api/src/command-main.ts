import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CommandService } from './command/command.service';
import { ApiConfigService } from './api-config';
import { loggerFactory } from './utils/logging/logger-factory';
import { requestContext } from './utils/logging/request-context';
import { v4 as uuid } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    bufferLogs: true
  });
  const configService = app.get(ApiConfigService);
  const logger = loggerFactory.create(configService);
  app.useLogger(logger);
  app.flushLogs();
  const contextId = uuid();
  requestContext.setContext(contextId);

  const commandService = app.get(CommandService);
  await commandService.runCommand();

  await app.close();
}

bootstrap();
