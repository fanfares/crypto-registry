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

const apiConfigService = {
  dbUrl: process.env.MONGO_URL,
  paymentPercentage: 0.01,
  isTestMode: true,
  hashingAlgorithm: 'simple'
} as ApiConfigService;

export const createTestModule = async (): Promise<TestingModule> => {
  return await Test.createTestingModule({
    controllers: [
      SubmissionController,
      CustomerController
    ],
    providers: [
      MockAddressDbService,
      SubmissionDbService,
      ExchangeDbService,
      CustomerHoldingsDbService,
      SubmissionService,
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
