import { Logger, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db/mongo.service';
import { CryptoService } from './crypto/crypto.service';
import { CryptoController } from './crypto/crypto.controller';
import { ApiConfigService } from './api-config/api-config.service';
import { SystemController } from './system/system.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExchangeController, ExchangeDbService } from './exchange';
import { CustomerController, CustomerHoldingsDbService } from './customer';
import { ExchangeService } from './exchange/exchange.service';
import { TestController } from './testing/test.controller';
import { MockCryptoService } from './crypto/mock-crypto.service';
import { BitcoinCryptoService } from './crypto/bitcoin-crypto.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail-service';
import { SES } from 'aws-sdk';

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
            dir: join(__dirname, 'mail/templates'),
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
    ApiConfigService,
    MailService,
    Logger,
    {
      provide: CryptoService,
      useFactory: (
        configService: ApiConfigService,
        logger: Logger
      ) => {
        if (configService.isTestMode) {
          logger.warn('Running in Test Mode');
        }
        return configService.isTestMode
          ? new MockCryptoService(configService)
          : new BitcoinCryptoService(configService);
      },
      inject: [ApiConfigService, Logger]
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
