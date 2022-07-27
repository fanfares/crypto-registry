import { Module, Logger } from '@nestjs/common';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db/mongo.service';
import { CustodianWalletController, CustodianWalletService } from './custodian-wallet';
import { CustomerHoldingController, CustomerHoldingService } from './customer-holding';
import { BlockChainService } from './block-chain/block-chain.service';
import { BlockChainController } from './block-chain/block-chain.controller';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'assets', 'api-docs'),
      serveRoot: '/docs'
    })
  ],
  controllers: [CustodianWalletController, CustomerHoldingController, BlockChainController],
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
    ConfigService, {
      provide: MongoService,
      useFactory: async (
        configService: ConfigService,
      ) => {
        const mongoService = new MongoService(configService);
        await mongoService.connect();
        return mongoService;
      },
      inject: [ConfigService]
    }
  ]
})
export class AppModule {
}
