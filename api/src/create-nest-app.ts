import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { processValidationErrors } from './utils';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

export const createNestApp = async (
  createTestApp = false
): Promise<INestApplication> => {
  const logger = new Logger();
  let app: NestExpressApplication;
  if (createTestApp) {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleRef.createNestApplication({
      logger: logger
    });
  } else {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: logger
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
  app.enableShutdownHooks();
  app.use(cookieParser());
  await app.init();
  return app;
};
