// import { TestingModule } from '@nestjs/testing/testing-module';
// import { NetworkController } from '../network/network.controller';
// import { FundingAddressService, FundingSubmissionController, FundingSubmissionService } from '../funding-submission';
// import { HoldingsSubmissionController, HoldingsSubmissionService } from '../holdings-submission';
// import { VerificationController, VerificationService } from '../verification';
// import { AuthController, AuthService } from '../auth';
// import { TestController } from './test.controller';
// import { NodeController } from '../node/node.controller';
// import { SystemController } from '../system/system.controller';
// import { ToolsController } from '../tools/tools.controller';
// import { UserController, UserService } from '../user';
// import { ControlService } from '../control';
// import { TestService } from './test.service';
// import { NodeService } from '../node';
// import { ExchangeService } from '../exchange/exchange.service';
// import { TestUtilsService } from './test-utils.service';
// import { DbService } from '../db/db.service';
// import { Logger, Module } from '@nestjs/common';
// import { BitcoinCoreApiFactory } from '../bitcoin-core-api/bitcoin-core-api-factory.service';
// import { MockBitcoinCoreApiFactory } from '../bitcoin-core-api/mock-bitcoin-core-api-factory.service';
// import { MailService, MockSendMailService } from '../mail-service';
// import { MessageSenderService } from '../network/message-sender.service';
// import { MessageReceiverService } from '../network/message-receiver.service';
// import { SignatureService } from '../authentication/signature.service';
// import { MessageTransportService } from '../network/message-transport.service';
// import { RegistrationService } from '../registration/registration.service';
// import { ApiConfigService } from '../api-config';
// import { MockWalletService, WalletService } from '../bitcoin-service';
// import { SendMailService } from '../mail-service/send-mail-service';
// import { BitcoinServiceFactory } from '../bitcoin-service/bitcoin-service-factory';
// import { MongoService } from '../db';
// import { SyncService } from '../syncronisation/sync.service';
//
// @Module({
//   controllers: [
//     NetworkController,
//     FundingSubmissionController,
//     HoldingsSubmissionController,
//     VerificationController,
//     AuthController,
//     TestController,
//     NodeController,
//     SystemController,
//     ToolsController,
//     UserController
//     // BitcoinController,
//   ],
//   providers: [
//     ControlService,
//     TestService,
//     NodeService,
//     ExchangeService,
//     TestUtilsService,
//     AuthService,
//     UserService,
//     DbService,
//     FundingAddressService,
//     HoldingsSubmissionService,
//     FundingSubmissionService,
//     Logger,
//     {
//       provide: BitcoinCoreApiFactory,
//       useClass: MockBitcoinCoreApiFactory
//     },
//     MailService,
//     MessageSenderService,
//     MessageReceiverService,
//     VerificationService,
//     SignatureService,
//     {
//       provide: MessageTransportService,
//       useValue: messageTransportService
//     },
//     {
//       provide: RegistrationService,
//       useClass: RegistrationService
//     },
//     {
//       provide: ApiConfigService,
//       useValue: apiConfigService
//     },
//     {
//       provide: WalletService,
//       useFactory: (
//         dbService: DbService,
//         logger: Logger
//       ) => {
//         return new MockWalletService(dbService, logger);
//       },
//       inject: [DbService, Logger]
//     },
//     {
//       provide: SendMailService,
//       useClass: MockSendMailService
//     },
//     BitcoinServiceFactory,
//     {
//       provide: MongoService,
//       useFactory: async (
//         apiConfigService: ApiConfigService,
//         logger: Logger
//       ) => {
//         const mongoService = new MongoService(apiConfigService, logger);
//         mongoService
//         .connect()
//         .then(() => {
//           logger.log('Mongo Connected');
//         })
//         .catch(() => {
//           logger.error('Mongo Failed to connect');
//         });
//         return mongoService;
//       },
//       inject: [ApiConfigService, Logger]
//     },
//     SyncService
//   ]
// })
// export class TestModule {
//
// }
