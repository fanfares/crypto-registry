import { Test } from '@nestjs/testing';
import { VerificationController, VerificationService } from '../verification';
import { BitcoinController, MockBitcoinService } from '../crypto';
import { ApiConfigService } from '../api-config';
import { MongoService } from '../db';
import { TestingModule } from '@nestjs/testing/testing-module';
import { MailService, MockSendMailService } from '../mail-service';
import { Logger } from '@nestjs/common';
import { MockWalletService } from '../crypto/mock-wallet.service';
import { testnetRegistryZpub } from '../crypto/exchange-mnemonic';
import { WalletService } from '../crypto/wallet.service';
import { DbService } from '../db/db.service';
import { Network } from '@bcr/types';
import { BitcoinServiceFactory } from '../crypto/bitcoin-service-factory';
import { RegistrationService } from '../registration/registration.service';

import { SignatureService } from '../authentication/signature.service';
import { SendMailService } from '../mail-service/send-mail-service';
import { UserController, UserService } from '../user';
import { TestController } from './test.controller';
import { TestUtilsService } from './test-utils.service';
import { NodeService } from '../node';
import { NetworkController } from '../network/network.controller';
import { SyncService } from '../syncronisation/sync.service';
import { MockMessageTransportService } from '../network/mock-message-transport.service';
import { MessageSenderService } from '../network/message-sender.service';
import { MessageReceiverService } from '../network/message-receiver.service';
import { MessageTransportService } from '../network/message-transport.service';
import { BitcoinCoreService } from '../bitcoin-core-api/bitcoin-core-service';
import { NodeController } from '../node/node.controller';
import { MockBitcoinCoreService } from '../bitcoin-core-api/mock-bitcoin-core-service';
import { HoldingsSubmissionController, HoldingsSubmissionService } from '../holdings-submission';
import { FundingSubmissionController, FundingSubmissionService, RegisteredAddressService } from '../funding-submission';
import { ExchangeService } from '../exchange/exchange.service';
import { TestService } from './test.service';

export const createTestModule = async (
  messageTransportService: MockMessageTransportService,
  nodeNumber: number,
  singleNode = false
): Promise<TestingModule> => {

  const apiConfigService = {
    syncMessageSending: true,
    dbUrl: process.env.MONGO_URL,
    paymentPercentage: 0.01,
    isTestMode: true,
    bitcoinApi: 'mock',
    hashingAlgorithm: 'simple',
    isSingleNodeService: singleNode,
    getRegistryZpub: (network: Network) => testnetRegistryZpub, //eslint-disable-line
    reserveLimit: 0.9,
    logLevel: 'info',
    maxSubmissionAge: 7,
    jwtSigningSecret: 'qwertyuiop',
    ownerEmail: `owner@node-${nodeNumber || ''}.com`,
    institutionName: `Institution-${nodeNumber}`,
    nodeAddress: `http://node-${nodeNumber}/`,
    nodeName: `node-${nodeNumber}`,
    isEmailEnabled: true,
    clientAddress: `http://client-${nodeNumber}/`,
    publicKeyBase64: 'LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tCk1JSUJDZ0tDQVFFQXBGcU9wcTI1R3lzY1QxeS9jQ0tEOFNCN2tQWkYyNGdKUXkxNFNlVTMyQ3ZWTUxsa3F2Y0gKQ3BYY2xmbnNETXE0THBUaHcvMWZtNllDeW96a09xMWhYTHAzdmVxU3BJQW1ZeTc3OGMzSHhsSEE5V3dvRWNBaQp0Z0g4K0NLeXB1cWExWmY0YVdoZkxQQ3RsTW1MOWRHZFY4Y0pMWW0rRFBWWHlxSHJrRmhGL09aRnJBTHBCOHRoCk5wVjBMWHlqZW9EQmVzMEI4WDgwalYxVFJHN0ptZ3FVUTFJS0lBRS9zUE1iQVc4bUZWcmxjQWllQ2NZYzR6TjYKTmVrUlhDQk1WMHdXQmhRRUlESExSUXUyVXJsODRKaUlmWldSd253eU93ZHdZYzEwbG5JVWZNaGtRM3VjRkpJUQo2ejIyUFJHMTZhYkdJUllXUkxyczNEWHcydE9OM0RuRWd3SURBUUFCCi0tLS0tRU5EIFJTQSBQVUJMSUMgS0VZLS0tLS0K',
    privateKeyBase64: 'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcFFJQkFBS0NBUUVBcEZxT3BxMjVHeXNjVDF5L2NDS0Q4U0I3a1BaRjI0Z0pReTE0U2VVMzJDdlZNTGxrCnF2Y0hDcFhjbGZuc0RNcTRMcFRody8xZm02WUN5b3prT3ExaFhMcDN2ZXFTcElBbVl5Nzc4YzNIeGxIQTlXd28KRWNBaXRnSDgrQ0t5cHVxYTFaZjRhV2hmTFBDdGxNbUw5ZEdkVjhjSkxZbStEUFZYeXFIcmtGaEYvT1pGckFMcApCOHRoTnBWMExYeWplb0RCZXMwQjhYODBqVjFUUkc3Sm1ncVVRMUlLSUFFL3NQTWJBVzhtRlZybGNBaWVDY1ljCjR6TjZOZWtSWENCTVYwd1dCaFFFSURITFJRdTJVcmw4NEppSWZaV1J3bnd5T3dkd1ljMTBsbklVZk1oa1EzdWMKRkpJUTZ6MjJQUkcxNmFiR0lSWVdSTHJzM0RYdzJ0T04zRG5FZ3dJREFRQUJBb0lCQVFDRkJYSmR2MCtKaUx2eQpFOXd4OHcyZE5MQXVKTlZubUZQKzFpZDhqNVJDVnovR250YTJkUmR5M3RaWllKMUh3UytQTEJzS1dPRndCYzVPCmgvZ1U4YzFTa3UxbGZoelFIWlIwUkV2UWFzQWRhSC9uWTNHTzVGWnp2Mm95bjBxL1JEU3JXY1BKOUpyTHNjU2MKSHdBenBrTldEeGNEajIrTjUyajE3VlhPVDFQZUdtblFZS0FkcXY2dG1MU2ErbGkyNjZlUkM0cm94SEd1M05uNgpEdlRTOEUzSUhLUTJLMUFDelRBVjVYbFgwSGhFcWNyVUkwM2hvdWdyTU1yMTR6SlEyUU1nYUVTUFN5encwQlZWCi93MlM1YlM3YytKR1hHbFhtU29ldnQxdUVqVzlKSmwzWGVqZ1lTUm14WUpRUENXSGJtYmt1VjhOQmFobWQ1Wk4KOWNGR09hdkJBb0dCQU5WVCtQdDBBaXFDb0Jjb3YxaktaeFBVbnIvcWdxZVZpOHhFdHJodkhCM1RTRHVkeitMNwpVSkJIRzRoK0h2alpPL0FLaklDUHpkN0tiZ2tIc003UkhQajRrc3dEcFF3eGpPSDZWZHdaN2ZieUFtYndrSHFVCnVzS2pZV3ZDKzcvRTZGQTQ0cDVEazJnQitldHpPN0xZc0xUZjZ4S3dCcUROQUlGVDRCczh2TjZqQW9HQkFNVTYKdWdsT3dWbWFqUlRDMWo2OG03U1dBS1BrbVAzN3Y5SU5mbGN3RWlQS1lSZlVpVUhpY09zd3Jibk1odFVWbjhFZApPcllBZDlQRlhFZGZSUTFMTmRFNjMra3JtRFVwSHpENitZczJaZUgvbUhMU2JkWExZZFZtMlcrQ2x4R0djcU85CkwrMWFRanFMWFlMTkRFM0o1UWl1dCtPZnpTR054eDRvaTBDUW8wQ2hBb0dCQU5RV2ZEOWlncFRJOFdpVTlrZk0KVXRhQVdLUHMvcUNtS1NxWVZpRGZObERnc2J1emxlN1FkTFE4UGI5aHhHRWJlRitaM1Q0anVrVjVkQlErTlNZbworR2orbU5PRC9CODNWQjJHeUwzZWVaczkxKzJIMWR4STZiU0F3bVprbisxMFVwTVBPeDZsaUhPckkxRldhMC9QCjV6NnNNQVdRUThheWlZSUtaWkF1dm9lSkFvR0JBSldCZWVwNlQ2anJ0Z3hKMFh4SEhzVGFmR3ZBYXBVRkZCaFgKY0RFSldJYlc3NWpQM0tnYnpic0s4SFlLYXg3MXdGNzBHRUJFeEpDOFo4SVdudEovODdEQ0wxK2lVMFBoQXlydQo1T0U1Z0N1N3c4VXViR0lIUlFjdWFwN1Q0RTVCbTM4eGR6WTJHRVFteHVEVExJTi9DdVgxQTZKQnpZNmsyWTZyCjd6c25LUWxoQW9HQUIxdjltTDdRVWRpMC9NY0Rvd0hnRGRiMzI4a3ROR0lPYUZiVllXeWJBVG5xTmJER003T1kKU3JraGNraGZxcWhqclJJZTkwSHlEMFFlUFRleEY0Q1BNTGFFMk9reTVTeWFaSDh1eVZmbUZyTy96UEFhcE11OQpMVCt1UUxnbkpqdlhrRlBoZ0VVNTFOWmlSMzhxR1QrV2czR1htZWgzcnFIUEhuY3gwcXE4R2hjPQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo'
  } as ApiConfigService;

  return await Test.createTestingModule({
    controllers: [
      NetworkController,
      FundingSubmissionController,
      HoldingsSubmissionController,
      VerificationController,
      BitcoinController,
      UserController,
      TestController,
      NodeController
    ],
    providers: [
      TestService,
      NodeService,
      ExchangeService,
      TestUtilsService,
      UserService,
      DbService,
      RegisteredAddressService,
      HoldingsSubmissionService,
      FundingSubmissionService,
      Logger,
      {
        provide: BitcoinCoreService,
        useClass: MockBitcoinCoreService
      },
      MailService,
      MessageSenderService,
      MessageReceiverService,
      VerificationService,
      SignatureService,
      {
        provide: MessageTransportService,
        useValue: messageTransportService
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
        useFactory: (
          dbService: DbService,
          apiConfigService: ApiConfigService,
          logger: Logger
        ) => {
          return new MockWalletService(dbService, apiConfigService, logger);
        },
        inject: [DbService, ApiConfigService, Logger]
      },
      {
        provide: SendMailService,
        useClass: MockSendMailService
      },
      {
        provide: BitcoinServiceFactory,
        useFactory: (dbService: DbService,
                     logger: Logger
        ) => {
          const service = new BitcoinServiceFactory();
          service.setService(Network.testnet, new MockBitcoinService(dbService, logger));
          service.setService(Network.mainnet, new MockBitcoinService(dbService, logger));
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
          const mongoService = new MongoService(apiConfigService, logger);
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
      },
      SyncService
    ]
  }).compile();
};
