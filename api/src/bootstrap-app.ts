import { createNestApp } from './create-nest-app';

export async function bootstrapApp() {
  return await createNestApp();
}
