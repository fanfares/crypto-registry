import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { processValidationErrors } from './utils/validation';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

export const createNestApp = async (createTestApp = false): Promise<INestApplication> => {
  let app: NestExpressApplication;
  if (createTestApp) {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();
    app = moduleRef.createNestApplication();
  } else {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
  }
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: processValidationErrors,
    transform: true,
    whitelist: true
  }));
  app.enableShutdownHooks();
  app.use(cookieParser());
  await app.init();
  return app;
};
