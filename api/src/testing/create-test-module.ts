import { Test } from '@nestjs/testing';
import { CustodianController, CustodianDbService } from '../custodian';
import { CustomerHoldingsDbService, CustomerController } from '../customer';
import { BlockChainService } from '../block-chain/block-chain.service';
import { ApiConfigService } from '../api-config/api-config.service';
import { MongoService } from '../db/mongo.service';
import { MockBlockChainService } from '../custodian/custodian.controller.spec';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MailService } from '../mail/mail.service';
import { MockMailService } from '../mail/mock-mail-service';
import { Logger } from '@nestjs/common';

export const createTestModule = async (): Promise<TestingModule> => {
  return await Test.createTestingModule({
    controllers: [
      CustodianController,
      CustomerController
    ],
    providers: [
      CustodianDbService,
      CustomerHoldingsDbService,
      {
        provide: Logger,
        useFactory: () => {
          return new Logger('Default Logger');
        }
      },
      {
        provide: MailService,
        useClass: MockMailService
      },
      {
        provide: BlockChainService,
        useValue: new MockBlockChainService()
      },
      {
        provide: ApiConfigService,
        useValue: {
          get dbUrl(): string {
            return process.env.MONGO_URL;
          },
          get maxBalanceTolerance(): number {
            return 1000000;
          }
        }
      },
      {
        provide: MongoService,
        useFactory: async (apiConfigService: ApiConfigService) => {
          const mongoService = new MongoService(apiConfigService);
          mongoService.connect()
            .then(() => {
              console.log('Mongo Connected');
            })
            .catch(() => {
              console.error('Mongo Failed to connect');
            });
          return mongoService;
        },
        inject: [ApiConfigService]
      }
    ]
  }).compile();

};
