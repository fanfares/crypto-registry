import { MongoClient } from 'mongodb';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ApiConfigService } from '../api-config';

@Injectable()
export class MongoService implements OnModuleDestroy {

  public logger = new Logger(MongoService.name);

  client: MongoClient | undefined;

  constructor(
    private configService: ApiConfigService
  ) {
  }

  get db() {
    return this.client?.db();
  }

  async connect() {
    if (!this.client) {
      this.logger.log(
        `Creating Mongo connection to ${this.configService.dbUrl}`
      );
      try {
        this.client = new MongoClient(this.configService.dbUrl);
        await this.client.connect();
        this.logger.log('Mongo Connected');
      } catch (err) {
        this.logger.error('Mongo Failed to connect', err);
      }
    }
  }

  async onModuleDestroy() {
    this.logger.log('Destroy MongoService');
    await this.close();
  }

  async close() {
    if (this.client) {
      this.logger.log('Close MongoDb connection');
      await this.client?.close();
      this.client = null;
    }
  }
}
