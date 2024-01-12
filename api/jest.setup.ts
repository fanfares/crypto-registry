import MongoTestServer from './mongo-test-server';

module.exports = async () => {
    process.on('warning', e => console.warn(e.stack));
    process.env.MONGO_URL = await MongoTestServer.create();
};
