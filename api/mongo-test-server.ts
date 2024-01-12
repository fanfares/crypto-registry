import { MongoMemoryServer } from 'mongodb-memory-server';

class MongoJestServer {
    public mongod: MongoMemoryServer;

    async create(): Promise<string> {
        this.mongod = await MongoMemoryServer.create({
            instance: {
                storageEngine: 'wiredTiger'
            }
        });
        return this.mongod.getUri();
    }

    async stop() {
        return this.mongod.stop();
    }
}

export default new MongoJestServer();
