import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { Test } from '@nestjs/testing';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { ConfigModule } from '@nestjs/config';
import { MongoService } from '../db';
import { VerificationController, VerificationService } from '../verification';
import { MailService, MockSendMailService } from '../mail-service';
import { Logger } from '@nestjs/common';
import { ConsoleLoggerService } from '../utils';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { MailerService } from '@nestjs-modules/mailer';
import { EventGateway, MockEventGateway } from '../event-gateway';
import { NodeService } from '../node';
import { SignatureService } from '../authentication/signature.service';
import { BitcoinCoreService } from '../bitcoin-core-api/bitcoin-core-service';
import { SendMailService } from '../mail-service/send-mail-service';
import { UserService } from '../user';
import { HoldingsSubmissionController, HoldingsSubmissionService } from '../holdings-submission';
import { ExchangeService } from '../exchange/exchange.service';
import { FundingSubmissionController, FundingSubmissionService, RegisteredAddressService } from '../funding-submission';

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
      {provide: EventGateway, useClass: MockEventGateway},
      VerificationService,
      HoldingsSubmissionService,
      FundingSubmissionService,
      RegisteredAddressService,
      ExchangeService,
      DbService,
      NodeService,
      SignatureService,
      UserService,
      ApiConfigService,
      MongoService,
      BitcoinServiceFactory,
      BitcoinCoreService,
      {provide: SendMailService, useClass: MockSendMailService},
      MailService,
      {provide: Logger, useClass: ConsoleLoggerService},
      {provide: WalletService, useValue: null},
      {provide: MailerService, useValue: MockSendMailService}
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

  fs.writeFileSync(
    path.join(__dirname, '..', '..', 'assets', 'api-docs', 'openapi.json'),
    JSON.stringify(document, null, 2)
  );
  console.log('API Docs Export complete');
};

// eslint-disable-next-line
exportSwaggerDocs().catch(err => console.error(err)).then();
