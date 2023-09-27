import * as openApi from 'openapi-typescript-codegen';
import { Options } from 'openapi-typescript-codegen';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { Test } from "@nestjs/testing";
import { AppModule } from "../app.module";

const exportClientTypes = async () => {
  console.log('Exporting client types...');
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  const options = new DocumentBuilder().build();
  const document = SwaggerModule.createDocument(app, options, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey
  });
  fs.writeFileSync('openapi.json', JSON.stringify(document, null, 2));
  // todo - still not closing properly.
  await app.close();

  const apiGenerationOptions: Options = {
    input: './openapi.json',
    output: '../client/src/open-api',
    exportSchemas: false,
    exportServices: true,
    exportCore: false,
  };
  await openApi.generate(apiGenerationOptions);
  console.log('client types export complete.');
};

// eslint-disable-next-line
exportClientTypes().catch(err => console.log(err)).then();
