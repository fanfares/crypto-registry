import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { Test } from '@nestjs/testing';
import { SubmissionController, SubmissionService } from '../submission';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { ConfigModule } from '@nestjs/config';
import { MongoService } from '../db';
import { VerificationController } from '../verification';
import { MailService } from '../mail-service';
import { Logger } from '@nestjs/common';
import { CustomLogger } from '../utils';
import { MockWalletService } from '../crypto/mock-wallet.service';
import { MockMailService } from '../mail-service/mock-mail-service';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';

const exportSwaggerDocs = async () => {
  console.log('Exporting API Docs...');
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.local'
      })
    ],
    controllers: [
      SubmissionController,
      VerificationController
    ],
    providers: [
      SubmissionService,
      DbService,
      ApiConfigService,
      MongoService,
      BitcoinServiceFactory,
      { provide: Logger, useClass: CustomLogger },
      { provide: WalletService, useClass: MockWalletService },
      { provide: MailService, useValue: MockMailService }
    ]
  }).compile();
  const app = moduleRef.createNestApplication();

  const options = new DocumentBuilder()
    .setTitle('Crypto Registry API')
    .setDescription('API for exchanges to submit their customer holdings, and for customers to verify their holdings')
    .setVersion('Version 1')
    .build();

  const document = SwaggerModule.createDocument(app, options, {});
  await app.close();

  fs.writeFileSync(
    path.join(__dirname, '..', '..', 'assets', 'api-docs', 'openapi.json'),
    JSON.stringify(document, null, 2)
  );
  console.log('API Docs Export complete');
};

// eslint-disable-next-line
exportSwaggerDocs().catch(err => console.error(err)).then();
