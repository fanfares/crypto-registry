import { Module, Logger } from '@nestjs/common';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db/mongo.service';
import { CustodianWalletController, CustodianWalletService } from './custodian-wallet';
import { CustomerHoldingController, CustomerHoldingService } from './customer-holding';
import { BlockChainService } from './block-chain/block-chain.service';
import { BlockChainController } from './block-chain/block-chain.controller';
import { ApiConfigService } from './config/api-config.service';
import { ConfigModule } from '@nestjs/config';
import { SystemController } from './system/system.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'assets', 'api-docs'),
      serveRoot: '/docs'
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'client', 'build'),
      serveRoot: '/'
    }),
    ConfigModule.forRoot({
      envFilePath: '.env.' + process.env.NODE_ENV
    })
  ],
  controllers: [
    CustodianWalletController,
    CustomerHoldingController,
    BlockChainController,
    SystemController],
  providers: [
    CustodianWalletService,
    CustomerHoldingService,
    BlockChainService,
    {
      provide: Logger,
      useFactory: () => {
        return new Logger('Default Logger');
      }
    },
    ApiConfigService, {
      provide: MongoService,
      useFactory: async (
        configService: ApiConfigService
      ) => {
        const mongoService = new MongoService(configService);
        await mongoService.connect();
        return mongoService;
      },
      inject: [ApiConfigService]
    }
  ]
})
export class AppModule {
}
