import { Module } from '@nestjs/common';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db/mongo.service';
import { CustodianWalletController, CustodianWalletService } from './custodian-wallet';
import { CustomerHoldingController, CustomerHoldingService } from './customer-holding';
import { BlockChainService } from './block-chain/block-chain.service';
import { BlockChainController } from './block-chain/block-chain.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'assets', 'api-docs'),
      serveRoot: '/docs'
    })
  ],
  controllers: [CustodianWalletController, CustomerHoldingController, BlockChainController],
  providers: [{
    provide: MongoService, useFactory: async () => {
      const mongoService = new MongoService();
      await mongoService.connect();
      return mongoService;
    }
  }, CustodianWalletService, CustomerHoldingService, BlockChainService]
})
export class AppModule {
}
