import { Test } from '@nestjs/testing';
import { CustomerController } from '../customer';
import { CryptoController, MockBitcoinService } from '../crypto';
import { ApiConfigService } from '../api-config';
import { MongoService } from '../db';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MailService } from '../mail-service';
import { MockMailService } from '../mail-service/mock-mail-service';
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

export const createTestModule = async (): Promise<TestingModule> => {

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
    p2pLocalAddress: 'https://crypto.service.com/'
  } as ApiConfigService;

  return await Test.createTestingModule({
    controllers: [
      SubmissionController,
      CustomerController,
      CryptoController
    ],
    providers: [
      MockWalletService,
      DbService,
      SubmissionService,
      Logger,
      MailService,
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
        provide: MailService,
        useClass: MockMailService
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
