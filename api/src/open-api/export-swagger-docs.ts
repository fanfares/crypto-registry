import { createNestApp } from '../create-nest-app';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

const exportSwaggerDocs = async () => {
  console.log('Exporting API Docs...');
  const app = await createNestApp(true);
  const options = new DocumentBuilder()
    .setTitle('Crypto Registry API')
    .setDescription('TBC')
    .setVersion('TCB')
    .build();

  const document = SwaggerModule.createDocument(app, options, {});
  await app.close();

  fs.writeFileSync(
    path.join(__dirname, '..', '..', 'assets', 'api-docs', 'openapi.json'),
    JSON.stringify(document, null, 2),
  );
  console.log('API Docs Export complete');
};

// eslint-disable-next-line
exportSwaggerDocs().catch(err => console.error(err)).then();
