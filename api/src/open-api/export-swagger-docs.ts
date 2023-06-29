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
import { MailService, MockSendMailService } from '../mail-service';
import { Logger } from '@nestjs/common';
import { ConsoleLoggerService } from '../utils';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { MailerService } from '@nestjs-modules/mailer';

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
      MailService,
      {provide: Logger, useClass: ConsoleLoggerService},
      {provide: WalletService, useValue: null},
      {provide: MailerService, useValue: MockSendMailService}
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
