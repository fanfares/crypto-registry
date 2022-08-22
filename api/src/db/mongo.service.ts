import { MongoClient } from 'mongodb';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ApiConfigService } from '../api-config/api-config.service';

@Injectable()
export class MongoService implements OnModuleDestroy {
  client: MongoClient | undefined;
  private readonly logger = new Logger(MongoService.name);

  constructor(
    private configService: ApiConfigService
  ) {
  }

  get db() {
    return this.client?.db();
  }

  async connect() {
    if (!this.client) {
      this.logger.log(`Creating Mongo connection to ${this.configService.dbUrl}`);
      this.client = new MongoClient(this.configService.dbUrl, {useUnifiedTopology: true});
      await this.client.connect();
    }
  }

  async onModuleDestroy() {
    this.logger.log('Destroy MongoService');
    await this.close();
  }

  async close() {
    this.logger.log('Close MongoDb connection');
    await this.client?.close();
    this.client = null;
  }

}

