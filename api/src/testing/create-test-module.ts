import { Test } from '@nestjs/testing';
import { VerificationController, VerificationService } from '../verification';
import { CryptoController, MockBitcoinService } from '../crypto';
import { ApiConfigService } from '../api-config';
import { MongoService } from '../db';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MailService, MockSendMailService } from '../mail-service';
import { Logger } from '@nestjs/common';
import { SubmissionController, SubmissionService } from '../submission';
import { MockWalletService } from '../crypto/mock-wallet.service';
import { getZpubFromMnemonic } from '../crypto/get-zpub-from-mnemonic';
import { registryMnemonic } from '../crypto/exchange-mnemonic';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { Network } from '@bcr/types';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { RegistrationService } from '../registration/registration.service';
import { MessageSenderService } from '../network/message-sender.service';
import { MessageTransportService } from '../network/message-transport.service';
import { MockMessageTransportService } from '../network/mock-message-transport.service';
import { MessageReceiverService } from '../network/message-receiver.service';
import { EventGateway } from '../network/event.gateway';
import { MockEventGateway } from '../network/mock-event-gateway';
import { SignatureService } from '../authentication/signature.service';
import { SendMailService } from '../mail-service/send-mail-service';

export interface CreateTestModuleOptions {
  node: number;
}

export const createTestModule = async (
  options?: CreateTestModuleOptions
): Promise<TestingModule> => {

  const apiConfigService = {
    dbUrl: process.env.MONGO_URL,
    paymentPercentage: 0.01,
    isTestMode: true,
    hashingAlgorithm: 'simple',
    getRegistryZpub: (network: Network) => getZpubFromMnemonic(registryMnemonic, 'password', network),
    reserveLimit: 0.9,
    logLevel: 'info',
    maxSubmissionAge: 7,
    jwtSigningSecret: 'qwertyuiop',
    nodeAddress: options?.node ? `http://node-${options.node}/` : 'https://crypto.service.com/',
    nodeName: options?.node ? `node-${options.node}` : 'single-node',
    isEmailEnabled: true,
    email: {
      fromEmail: 'head@exchange.com'
    },
    clientAddress: options?.node ? `http://client-${options.node}/` : 'http://client.cr.com'
  } as ApiConfigService;

  return await Test.createTestingModule({
    controllers: [
      SubmissionController,
      VerificationController,
      CryptoController
    ],
    providers: [
      MockWalletService,
      DbService,
      SubmissionService,
      Logger,
      MailService,
      MessageSenderService,
      MessageReceiverService,
      VerificationService,
      SignatureService,
      {
        provide: EventGateway,
        useClass: MockEventGateway
      },
      {
        provide: MessageTransportService,
        useClass: MockMessageTransportService
      },
      {
        provide: RegistrationService,
        useClass: RegistrationService
      },
      {
        provide: ApiConfigService,
        useValue: apiConfigService
      },
      {
        provide: WalletService,
        useFactory: (dbService: DbService) => {
          return new MockWalletService(dbService);
        },
        inject: [DbService]
      },
      {
        provide: SendMailService,
        useClass: MockSendMailService
      },
      {
        provide: BitcoinServiceFactory,
        useFactory: (dbService: DbService, logger: Logger) => {
          const service = new BitcoinServiceFactory();
          service.setService(Network.testnet, new MockBitcoinService(dbService, logger));
          return service;
        },
        inject: [DbService, Logger]
      },
      {
        provide: MongoService,
        useFactory: async (
          apiConfigService: ApiConfigService,
          logger: Logger
        ) => {
          const mongoService = new MongoService(apiConfigService);
          mongoService
            .connect()
            .then(() => {
              logger.log('Mongo Connected');
            })
            .catch(() => {
              logger.error('Mongo Failed to connect');
            });
          return mongoService;
        },
        inject: [ApiConfigService, Logger]
      }
    ]
  }).compile();
};
