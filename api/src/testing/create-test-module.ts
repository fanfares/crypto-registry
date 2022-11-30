import { Test } from '@nestjs/testing';
import { ExchangeController, ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService, CustomerController } from '../customer';
import { CryptoService } from '../crypto/crypto.service';
import { ApiConfigService } from '../api-config/api-config.service';
import { MongoService } from '../db/mongo.service';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MailService } from '../mail/mail.service';
import { MockMailService } from '../mail/mock-mail-service';
import { Logger } from '@nestjs/common';
import { MockCryptoService } from '../crypto/mock-crypto.service';
import { ExchangeService } from '../exchange/exchange.service';

const apiConfigService = {
  dbUrl: process.env.MONGO_URL,
  registrationCost: 10,
  isTestMode: true,
  registryKey: 'crypto-registry',
} as ApiConfigService;

export const createTestModule = async (): Promise<TestingModule> => {
  return await Test.createTestingModule({
    controllers: [ExchangeController, CustomerController],
    providers: [
      ExchangeDbService,
      ExchangeService,
      CustomerHoldingsDbService,
      {
        provide: Logger,
        useFactory: () => {
          return new Logger('Default Logger');
        },
      },
      {
        provide: MailService,
        useClass: MockMailService,
      },
      {
        provide: CryptoService,
        useValue: new MockCryptoService(apiConfigService),
      },
      {
        provide: ApiConfigService,
        useValue: apiConfigService,
      },
      {
        provide: MongoService,
        useFactory: async (
          apiConfigService: ApiConfigService,
          logger: Logger,
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
        inject: [ApiConfigService, Logger],
      },
    ],
  }).compile();
};
