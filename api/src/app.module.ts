import { Logger, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db/mongo.service';
import { CryptoController } from './crypto/crypto.controller';
import { ApiConfigService } from './api-config/api-config.service';
import { SystemController } from './system/system.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExchangeController, ExchangeDbService } from './exchange';
import { CustomerController, CustomerHoldingsDbService } from './customer';
import { ExchangeService } from './exchange/exchange.service';
import { TestController } from './testing/test.controller';
import { MockBitcoinService } from './crypto/mock-bitcoin.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail-service';
import { SES } from 'aws-sdk';
import { BitcoinService } from './crypto/bitcoin.service';
import { OnChainBitcoinService } from './crypto/on-chain-bitcoin.service';
import { SubmissionDbService } from './exchange/submission-db.service';
import { MockAddressDbService } from './crypto/mock-address-db.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'assets', 'api-docs'),
      serveRoot: '/docs'
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'build'),
      serveRoot: '/'
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
    ExchangeController,
    CustomerController,
    CryptoController,
    SystemController,
    TestController
  ],
  providers: [
    ExchangeDbService,
    ExchangeService,
    CustomerHoldingsDbService,
    SubmissionDbService,
    ApiConfigService,
    MailService,
    MockAddressDbService,
    Logger,
    {
      provide: BitcoinService,
      useFactory: (
        mongoService: MongoService,
        apiConfigService: ApiConfigService,
        logger: Logger
      ) => {
        if (apiConfigService.isTestMode) {
          logger.warn('Running in Test Mode');
          return new MockBitcoinService(mongoService);
        }
        return new OnChainBitcoinService();
      },
      inject: [ApiConfigService, MongoService, Logger]
    },
    {
      provide: MongoService,
      useFactory: async (configService: ApiConfigService, logger: Logger) => {
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
