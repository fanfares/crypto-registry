import { Logger, Module } from '@nestjs/common';
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
import { SubmissionController, SubmissionService } from './submission';
import { ExchangeController } from './exchange';
import { WalletService } from './crypto/wallet.service';
import { MockWalletService } from './crypto/mock-wallet.service';
import { BitcoinWalletService } from './crypto/bitcoin-wallet.service';
import { DbService } from './db/db.service';
import { CustomLogger } from './utils';
import { BitcoinServiceFactory } from './crypto/bitcoin-service-factory';
import { Network } from '@bcr/types';
import { BlockstreamBitcoinService } from './crypto/blockstream-bitcoin.service';
import { NetworkController } from './network/network.controller';
import { MessageSenderService } from './network/message-sender.service';
import { MessageTransportService } from './network/message-transport.service';
import { AxiosMessageTransportService } from './network/axios-message-transport.service';
import { EventGateway } from './network/event.gateway';
import { MessageReceiverService } from './network/message-receiver.service';
import { SignatureService } from './authentication/signature.service';
import { RegistrationService } from './registration/registration.service';
import { SendMailService } from './mail-service/send-mail-service';
import { RegistrationController } from './registration/registration.controller';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { TestUtilsService } from './testing/test-utils.service';
import { NodeService } from './node';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './utils/intercept-logger';
import { SynchronisationService } from './syncronisation/synchronisation.service';

@Module({
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
  controllers: [
    SubmissionController,
    VerificationController,
    BitcoinController,
    SystemController,
    TestController,
    ExchangeController,
    NetworkController,
    RegistrationController,
    UserController
  ],
  providers: [
    NodeService,
    UserService,
    EventGateway,
    SubmissionService,
    ApiConfigService,
    MailService,
    DbService,
    MessageSenderService,
    MessageReceiverService,
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
      provide: Logger,
      useClass: CustomLogger
    },
    {
      provide: WalletService,
      useFactory: (
        dbService: DbService,
        apiConfigService: ApiConfigService
      ) => {
        if (apiConfigService.isTestMode) {
          return new MockWalletService(dbService);
        }
        return new BitcoinWalletService(dbService);
      },
      inject: [DbService, ApiConfigService]
    },
    {
      provide: BitcoinServiceFactory,
      useFactory: (
        dbService: DbService,
        apiConfigService: ApiConfigService,
        logger: Logger
      ) => {
        const service = new BitcoinServiceFactory();
        if (apiConfigService.isTestMode) {
          logger.warn('Running in Test Mode');
          service.setService(Network.testnet, new MockBitcoinService(dbService, logger));
        } else if (apiConfigService.bitcoinApi === 'mempool') {
          service.setService(Network.mainnet, new MempoolBitcoinService(Network.mainnet, logger));
          service.setService(Network.testnet, new MempoolBitcoinService(Network.testnet, logger));
        } else if (apiConfigService.bitcoinApi === 'blockstream') {
          service.setService(Network.mainnet, new BlockstreamBitcoinService(Network.mainnet, logger));
          service.setService(Network.testnet, new BlockstreamBitcoinService(Network.testnet, logger));
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
        const mongoService = new MongoService(configService);
        try {
          await mongoService.connect();
        } catch (err) {
          logger.error('Mongo Failed to connect', err);
        }
        return mongoService;
      },
      inject: [ApiConfigService, Logger]
    },
    SynchronisationService
  ]
})
export class AppModule {
}
