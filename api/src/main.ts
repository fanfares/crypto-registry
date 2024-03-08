import { ApiConfigService } from './api-config';
import { createNestApp } from './create-nest-app';

async function bootstrap() {
  const app = await createNestApp();
  const configService = app.get(ApiConfigService);
  await app.listen(configService.port);
}

bootstrap();
