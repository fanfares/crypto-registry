  import { Logger, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db';
import { BitcoinController, MempoolBitcoinService, MockBitcoinService } from './crypto';
import { ApiConfigService } from './api-config';
import { SystemController } from './system/system.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VerificationController, VerificationService } from './verification';
import { TestController } from './testing';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail-service';
import { SES } from 'aws-sdk';
import { ExchangeController } from './exchange';
import { WalletService } from './crypto/wallet.service';
import { MockWalletService } from './crypto/mock-wallet.service';
import { BitcoinWalletService } from './crypto/bitcoin-wallet.service';
import { DbService } from './db/db.service';
import { ConsoleLoggerService } from './utils';
import { BitcoinServiceFactory } from './crypto/bitcoin-service-factory';
import { Network } from '@bcr/types';
import { BlockstreamBitcoinService } from './crypto/blockstream-bitcoin.service';

import { SignatureService } from './authentication/signature.service';
import { RegistrationService } from './registration/registration.service';
import { SendMailService } from './mail-service/send-mail-service';
import { RegistrationController } from './registration/registration.controller';
import { UserController, UserService } from './user';
import { TestUtilsService } from './testing/test-utils.service';
import { NodeService } from './node';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './utils/intercept-logger';
import { SyncService } from './syncronisation/sync.service';
import { ElectrumBitcoinService } from './electrum-api';
import { AwsLoggerService } from './utils/logging/';
import { ControlService } from './control';
import { NetworkController } from './network/network.controller';
import { MessageSenderService } from './network/message-sender.service';
import { EventGateway } from './event-gateway';
import { MessageReceiverService } from './network/message-receiver.service';
import { AxiosMessageTransportService } from './network/axios-message-transport.service';
import { MessageTransportService } from './network/message-transport.service';
import { NodeController } from './node/node.controller';
import { BitcoinCoreService } from './bitcoin-core-api/bitcoin-core-service';
import { HoldingsSubmissionController, HoldingsSubmissionService } from './holdings-submission';
import { FundingSubmissionController, FundingSubmissionService, RegisteredAddressService } from './funding-submission';
import { ExchangeService } from './exchange/exchange.service';
import { AuthenticateMiddleware } from './user/authenticate-middleware';

@Module({
  controllers: [
    HoldingsSubmissionController,
    FundingSubmissionController,
    VerificationController,
    BitcoinController,
    SystemController,
    TestController,
    ExchangeController,
    NetworkController,
    RegistrationController,
    UserController,
    NodeController
  ],
  imports: [
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets', 'api-docs'),
      serveRoot: '/docs'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'build'),
      exclude: ['/api*', '/docs*']
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.' + process.env.NODE_ENV
    }),
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          SES: new SES({
            region: config.get('AWS_SES_REGION'),
            credentials: {
              accessKeyId: config.get('AWS_SES_ACCESS_KEY_ID'),
              secretAccessKey: config.get('AWS_SES_SECRET_ACCESS_KEY_ID')
            }
          })
        },
        defaults: {
          from: config.get('OWNER_EMAIL')
        },
        template: {
          dir: join(__dirname, 'mail-service/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
      }),
      inject: [ConfigService]
    })
  ],
  providers: [
    RegisteredAddressService,
    MessageSenderService,
    HoldingsSubmissionService,
    FundingSubmissionService,
    {
      provide: Logger,
      useFactory: (configService: ApiConfigService) => {
        if (configService.loggerService === 'aws') {
          return new AwsLoggerService(configService, 'server-events');
        } else {
          return new ConsoleLoggerService(configService);
        }
      },
      inject: [ApiConfigService]
    },
    ExchangeService,
    ControlService,
    NodeService,
    UserService,
    EventGateway,
    ApiConfigService,
    MailService,
    DbService,
    MessageReceiverService,
    BitcoinCoreService,
    VerificationService,
    SignatureService,
    RegistrationService,
    SendMailService,
    TestUtilsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor
    },
    {
      provide: MessageTransportService,
      useClass: AxiosMessageTransportService
    },
    {
      provide: WalletService,
      useFactory: (
        dbService: DbService,
        apiConfigService: ApiConfigService,
        bitcoinServiceFactory: BitcoinServiceFactory,
        loggerService: Logger
      ) => {
        if (apiConfigService.bitcoinApi === 'mock') {
          return new MockWalletService(dbService, apiConfigService, loggerService);
        } else {
          return new BitcoinWalletService(dbService, loggerService, bitcoinServiceFactory);
        }
      },
      inject: [DbService, ApiConfigService, BitcoinServiceFactory, Logger]
    },
    {
      provide: BitcoinServiceFactory,
      useFactory: (
        dbService: DbService,
        apiConfigService: ApiConfigService,
        logger: Logger
      ) => {
        const service = new BitcoinServiceFactory();
        if (apiConfigService.bitcoinApi === 'mock') {
          service.setService(Network.mainnet, new MockBitcoinService(dbService, logger));
          service.setService(Network.testnet, new MockBitcoinService(dbService, logger));
        } else if (apiConfigService.bitcoinApi === 'mempool') {
          service.setService(Network.mainnet, new MempoolBitcoinService(Network.mainnet, logger));
          service.setService(Network.testnet, new MempoolBitcoinService(Network.testnet, logger));
        } else if (apiConfigService.bitcoinApi === 'blockstream') {
          service.setService(Network.mainnet, new BlockstreamBitcoinService(Network.mainnet, logger));
          service.setService(Network.testnet, new BlockstreamBitcoinService(Network.testnet, logger));
        } else if (apiConfigService.bitcoinApi === 'electrum') {
          // todo - mainnet
          // service.setService(Network.mainnet, new ElectrumBitcoinService(Network.mainnet, logger, apiConfigService));
          service.setService(Network.testnet, new ElectrumBitcoinService(Network.testnet, logger, apiConfigService));
        } else {
          throw new Error('BitcoinServiceFactory: invalid config');
        }
        return service;
      },
      inject: [DbService, ApiConfigService, Logger]
    },
    {
      provide: MongoService,
      useFactory: async (
        configService: ApiConfigService,
        logger: Logger) => {
        const mongoService = new MongoService(configService, logger);
        try {
          await mongoService.connect();
        } catch (err) {
          logger.error('Mongo Failed to connect', err);
        }
        return mongoService;
      },
      inject: [ApiConfigService, Logger]
    },
    SyncService
  ]
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(AuthenticateMiddleware)
    .forRoutes({path: 'funding-submission*', method: RequestMethod.ALL},
      {path: 'holdings-submission*', method: RequestMethod.ALL},
      {path: 'exchange*', method: RequestMethod.ALL},
      {path: 'bitcoin*', method: RequestMethod.ALL},
      {path: 'system*', method: RequestMethod.ALL},
      {path: 'test*', method: RequestMethod.ALL},
      {path: 'node*', method: RequestMethod.ALL}
    );
  }

}
