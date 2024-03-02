import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { Test } from '@nestjs/testing';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../bitcoin-service';
import { DbService } from '../db/db.service';
import { ConfigModule } from '@nestjs/config';
import { MongoService } from '../db';
import { VerificationController, VerificationService } from '../verification';
import { MailService, MockSendMailService } from '../mail-service';
import { Logger } from '@nestjs/common';
import { ConsoleLoggerService } from '../utils';
import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
import { MailerService } from '@nestjs-modules/mailer';
import { NodeService } from '../node';
import { SignatureService } from '../authentication/signature.service';
import { BitcoinCoreFactoryService } from '../bitcoin-core-api/bitcoin-core-factory.service';
import { SendMailService } from '../mail-service/send-mail-service';
import { HoldingsSubmissionController, HoldingsSubmissionService } from '../holdings-submission';
import { ExchangeService } from '../exchange/exchange.service';
import { FundingSubmissionController, FundingSubmissionService, RegisteredAddressService } from '../funding-submission';
import { UserSettingsController } from '../user-settings';

const exportSwaggerDocs = async () => {
  console.log('Exporting API Docs...');
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.local'
      })
    ],
    providers: [
      VerificationService,
      HoldingsSubmissionService,
      FundingSubmissionService,
      RegisteredAddressService,
      ExchangeService,
      DbService,
      NodeService,
      SignatureService,
      ApiConfigService,
      MongoService,
      BitcoinServiceFactory,
      BitcoinCoreFactoryService,
      {provide: SendMailService, useClass: MockSendMailService},
      MailService,
      {provide: Logger, useClass: ConsoleLoggerService},
      {provide: WalletService, useValue: null},
    ],
    controllers: [
      FundingSubmissionController,
      HoldingsSubmissionController,
      VerificationController
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

  const openApiJsonPath = path.join(__dirname, '..', '..', 'assets', 'api-docs', 'openapi.json');
  fs.writeFileSync(
    openApiJsonPath,
    JSON.stringify(document, null, 2)
  );
  console.log('API Docs exported to ' + openApiJsonPath);
};

// eslint-disable-next-line
exportSwaggerDocs().catch(err => console.error(err)).then();
