import { Test } from '@nestjs/testing';
import { ExchangeController, ExchangeDbService } from '../exchange';
import { CustomerController, CustomerHoldingsDbService } from '../customer';
import { BitcoinService } from '../crypto/bitcoin.service';
import { ApiConfigService } from '../api-config/api-config.service';
import { MongoService } from '../db/mongo.service';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MailService } from '../mail-service';
import { MockMailService } from '../mail-service/mock-mail-service';
import { Logger } from '@nestjs/common';
import { MockBitcoinService } from '../crypto/mock-bitcoin.service';
import { ExchangeService } from '../exchange/exchange.service';
import { SubmissionDbService } from '../exchange/submission-db.service';
import { MockAddressDbService } from '../crypto/mock-address-db.service';

const apiConfigService = {
  dbUrl: process.env.MONGO_URL,
  paymentPercentage: 0.01,
  isTestMode: true,
  hashingAlgorithm: 'simple'
} as ApiConfigService;

export const createTestModule = async (): Promise<TestingModule> => {
  return await Test.createTestingModule({
    controllers: [ExchangeController, CustomerController],
    providers: [
      ExchangeDbService,
      ExchangeService,
      CustomerHoldingsDbService,
      SubmissionDbService,
      MockAddressDbService,
      Logger,
      MailService,
      {
        provide: MailService,
        useClass: MockMailService
      },
      {
        provide: BitcoinService,
        useFactory: (mongoService: MongoService) => {
          return new MockBitcoinService(mongoService);
        },
        inject: [MongoService]
      },
      {
        provide: ApiConfigService,
        useValue: apiConfigService
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
