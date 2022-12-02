import { createNestApp } from './create-nest-app';
import { ApiConfigService } from './api-config/api-config.service';

async function bootstrap() {
  const app = await createNestApp();
  const configService = app.get(ApiConfigService);
  await app.listen(configService.port);
}

bootstrap();
