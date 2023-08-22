import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { processValidationErrors } from './utils';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ApiConfigService } from './api-config';

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
      whitelist: true
    })
  );
  const configService = app.get(ApiConfigService);
  const logger = app.get(Logger);
  app.useLogger(logger);
  logger.log(`Listening on ${configService.port}`);
  app.enableShutdownHooks();
  app.use(cookieParser());
  await app.init();
  return app;
};
