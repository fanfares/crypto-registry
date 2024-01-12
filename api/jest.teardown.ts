import MongoTestServer from './mongo-test-server';

module.exports = async () => {
    await MongoTestServer.stop();
};
