const mongoMemory = require('mongodb-memory-server');

class MongoTestServer {
  constructor() {
    this.mongod = new mongoMemory.MongoMemoryServer();
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

module.exports = new MongoTestServer();
