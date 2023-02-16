import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { processValidationErrors } from '../utils';
import { createTestModule } from './create-test-module';

export const createTestApp = async (): Promise<INestApplication> => {
  const module = await createTestModule();
  const app = module.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: processValidationErrors,
    transform: true,
    whitelist: true
  }));
  app.use(cookieParser());
  await app.init();
  return app;
};
