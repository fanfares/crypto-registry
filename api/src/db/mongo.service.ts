import { MongoClient } from 'mongodb';
import logger from '../utils/logging/logger';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';

@Injectable()
export class MongoService implements OnApplicationShutdown {
  databaseName: string;
  client: MongoClient | undefined;
  uri: string;
  inMemory: boolean;

  get db() {
    return this.client?.db(this.databaseName);
  }

  async connect() {
    if (!this.client) {
      logger.info('Creating Mongo connection', this.uri);
      this.client = new MongoClient('mongodb://localhost:27017/bcr', {useUnifiedTopology: true});
      await this.client.connect();
    }
  }

  async onApplicationShutdown(signal: string) {
    await this.close();
  }

  async close() {
    logger.info('Close MongoDb connection');
    await this.client?.close();
    this.client = null;
  }
}

