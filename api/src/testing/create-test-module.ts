import { Test } from '@nestjs/testing';
import { CustomerController } from '../customer';
import { BitcoinService, MockBitcoinService, MockAddressDbService } from '../crypto';
import { ApiConfigService } from '../api-config';
import { MongoService } from '../db';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MailService } from '../mail-service';
import { MockMailService } from '../mail-service/mock-mail-service';
import { Logger } from '@nestjs/common';
import { SubmissionService, SubmissionDbService, SubmissionController } from '../submission';
import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { MockWalletService } from '../crypto/mock-wallet.service';
import { getZpubFromMnemonic } from '../crypto/get-zpub-from-mnemonic';
import { registryMnemonic } from '../crypto/test-wallet-mnemonic';
import { WalletService } from '../crypto/wallet.service';

export const createTestModule = async (): Promise<TestingModule> => {

  const apiConfigService = {
    dbUrl: process.env.MONGO_URL,
    paymentPercentage: 0.01,
    isTestMode: true,
    hashingAlgorithm: 'simple',
    registryZpub: getZpubFromMnemonic(registryMnemonic, 'password', 'testnet'),
    reserveLimit: 0.9,
  } as ApiConfigService;

  return await Test.createTestingModule({
    controllers: [
      SubmissionController,
      CustomerController
    ],
    providers: [
      MockAddressDbService,
      MockWalletService,
      SubmissionDbService,
      ExchangeDbService,
      CustomerHoldingsDbService,
      SubmissionService,
      Logger,
      MailService,
      {
        provide: ApiConfigService,
        useValue: apiConfigService
      },
      {
        provide: WalletService,
        useFactory: (addressDbService: MockAddressDbService) => {
          return new MockWalletService(addressDbService);
        },
        inject: [MockAddressDbService]
      },
      {
        provide: MailService,
        useClass: MockMailService
      },
      {
        provide: BitcoinService,
        useFactory: (mockAddressDbService: MockAddressDbService) => {
          return new MockBitcoinService(mockAddressDbService);
        },
        inject: [MockAddressDbService]
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
