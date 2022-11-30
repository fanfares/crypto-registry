import { Logger, Module } from '@nestjs/common';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db/mongo.service';
import { CryptoService } from './crypto/crypto.service';
import { CryptoController } from './crypto/crypto.controller';
import { ApiConfigService } from './api-config/api-config.service';
import { SystemController } from './system/system.controller';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { ExchangeController, ExchangeDbService } from './exchange';
import { CustomerController, CustomerHoldingsDbService } from './customer';
import { ExchangeService } from './exchange/exchange.service';
import { TestController } from './test/test.controller';
import { MockCryptoService } from './crypto/mock-crypto.service';
import { BitcoinCryptoService } from './crypto/bitcoin-crypto.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'assets', 'api-docs'),
      serveRoot: '/docs',
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'client', 'build'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.' + process.env.NODE_ENV,
    }),
    MailModule,
  ],
  controllers: [
    ExchangeController,
    CustomerController,
    CryptoController,
    SystemController,
    TestController,
  ],
  providers: [
    ExchangeDbService,
    ExchangeService,
    CustomerHoldingsDbService,
    ApiConfigService,
    {
      provide: CryptoService,
      useFactory: (configService: ApiConfigService) => {
        return configService.isTestMode
          ? MockCryptoService
          : BitcoinCryptoService;
      },
      inject: [ApiConfigService],
    },
    Logger,
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
      inject: [ApiConfigService, Logger],
    },
  ],
})
export class AppModule {}
