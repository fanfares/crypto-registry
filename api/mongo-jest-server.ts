import { MongoMemoryServer } from 'mongodb-memory-server';

class MongoJestServer {
  public mongod: MongoMemoryServer
  constructor() {
    this.mongod = new MongoMemoryServer();
  }

  async start() {
    return this.mongod.start();
  }

  async stop() {
    return this.mongod.stop();
  }

  async getUri() {
    return this.mongod.getUri();
  }
}

export default new MongoJestServer();
