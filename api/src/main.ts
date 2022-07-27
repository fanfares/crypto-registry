import { createNestApp } from './create-nest-app';

async function bootstrap() {
  const app = await createNestApp();
  await app.listen(3000);
}

bootstrap();

