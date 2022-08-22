import MongoTestServer from './mongo-jest-server';

module.exports = async () => {
  await MongoTestServer.stop();
};
