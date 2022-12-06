import * as openApi from 'openapi-typescript-codegen';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { createNestApp } from '../create-nest-app';

const exportClientTypes = async () => {
  console.log('Exporting client types...');
  const app = await createNestApp(true);
  const options = new DocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, options, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
  });
  fs.writeFileSync('openapi.json', JSON.stringify(document, null, 2));
  await app.close();

  const apiGenerationOptions = {
    input: './openapi.json',
    output: '../client/src/open-api',
    exportSchemas: false,
    exportServices: true,
    exportCore: true
  };
  await openApi.generate(apiGenerationOptions);
  console.log('Client types export complete.');
};

// eslint-disable-next-line
exportClientTypes().catch(err => console.log(err)).then();
