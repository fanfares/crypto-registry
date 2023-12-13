import { createNestApp } from './create-nest-app';
import { ApiConfigService } from './api-config';

async function bootstrap() {
  const app = await createNestApp();
  const configService = app.get(ApiConfigService);
  if ( configService.loggerService === 'aws') {
    console.log('API Started, running with AWS Logging')
  }
  await app.listen(configService.port);
}

bootstrap();
