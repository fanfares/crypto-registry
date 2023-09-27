import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { Test } from '@nestjs/testing';
import { SubmissionController, SingleNodeSubmissionService, AbstractSubmissionService } from '../submission';
import { ApiConfigService } from '../api-config';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { ConfigModule } from '@nestjs/config';
import { MongoService } from '../db';
import { SingleNodeVerificationService, VerificationController, VerificationService } from '../verification';
import { MailService, MockSendMailService } from '../mail-service';
import { Logger } from '@nestjs/common';
import { ConsoleLoggerService } from '../utils';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { MailerService } from '@nestjs-modules/mailer';
import { EventGateway, MockEventGateway } from '../event-gateway';
import { NodeService } from '../node';
import { SubmissionWalletService } from '../submission/submission-wallet.service';
import { SignatureService } from '../authentication/signature.service';
import { BitcoinCoreService } from '../bitcoin-core-api/bitcoin-core-service';
import { SendMailService } from '../mail-service/send-mail-service';
import { UserService } from '../user/user.service';

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
      { provide: EventGateway, useClass: MockEventGateway },
      { provide: AbstractSubmissionService, useClass: SingleNodeSubmissionService },
      { provide: VerificationService, useClass: SingleNodeVerificationService },
      DbService,
      NodeService,
      SignatureService,
      UserService,
      ApiConfigService,
      MongoService,
      BitcoinServiceFactory,
      BitcoinCoreService,
      { provide: SendMailService, useClass: MockSendMailService },
      SubmissionWalletService,
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
