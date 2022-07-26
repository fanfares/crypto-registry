import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BalanceController } from './balance/balance.controller';
import * as path from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongoService } from './db/mongo.service';
import { CustodianService } from './db/custodian.service';
import { CustodianController } from './custodian/custodian.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'assets', 'api-docs'),
      serveRoot: '/docs'
    })
  ],
  controllers: [AppController, BalanceController, CustodianController],
  providers: [AppService, {
    provide: MongoService, useFactory: async () => {
      const mongoService = new MongoService();
      await mongoService.connect();
      return mongoService;
    }
  }, CustodianService]
})
export class AppModule {
}
