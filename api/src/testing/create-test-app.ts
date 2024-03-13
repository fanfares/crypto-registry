import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { processValidationErrors } from '../utils';
import { createTestModule, TestModuleOptions } from './create-test-module';
import { MockMessageTransportService } from '../network/mock-message-transport.service';

export const createTestApp = async (
  options?: TestModuleOptions
): Promise<INestApplication> => {
  const mockMessageTransportService = new MockMessageTransportService()
  const module = await createTestModule(mockMessageTransportService, 1, options);
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
