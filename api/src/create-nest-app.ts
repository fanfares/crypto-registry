import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { processValidationErrors } from './utils';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiConfigService } from './api-config';
import { assignRequestContext } from './utils/logging/request-context';
import { loggerFactory } from './utils/logging/logger-factory';

export const createNestApp = async (
  createTestApp = false
): Promise<INestApplication> => {
  let app: NestExpressApplication;
  if (createTestApp) {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleRef.createNestApplication({
      bufferLogs: true
    });
  } else {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      bufferLogs: true
    });
  }
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: processValidationErrors,
      transform: true,
      forbidNonWhitelisted: true,
      // forbidUnknownValues: true,
      whitelist: true
    })
  );
  const configService = app.get(ApiConfigService);
  const logger = loggerFactory.create(configService);
  app.useLogger(logger);
  app.flushLogs();
  app.use(assignRequestContext);

  if (configService.loggerService !== 'console') {
    console.log(`API started with ${configService.loggerService} logger`);
  }

  logger.log(`Listening on ${configService.port}`);
  app.enableShutdownHooks();
  app.use(cookieParser());
  await app.init();
  return app;
};
