import { Logger, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db';
import { CryptoController, BitcoinService, MockBitcoinService, MempoolBitcoinService } from './crypto';
import { ApiConfigService } from './api-config';
import { SystemController } from './system/system.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CustomerController } from './customer';
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

@Module({
  imports: [
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
          from: `"${config.get('MAIL_FROM_NAME')}" <${config.get(
            'MAIL_FROM'
          )}>`
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
    CustomerController,
    CryptoController,
    SystemController,
    TestController,
    ExchangeController
  ],
  providers: [
    SubmissionService,
    ApiConfigService,
    MailService,
    DbService,
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
      provide: BitcoinService,
      useFactory: (
        dbService: DbService,
        apiConfigService: ApiConfigService,
        logger: Logger
      ) => {
        if (apiConfigService.isTestMode) {
          logger.warn('Running in Test Mode');
          return new MockBitcoinService(dbService);
        }
        return new MempoolBitcoinService(apiConfigService, logger);
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
    }
  ]
})
export class AppModule {
}
