import MongoTestServer from './mongo-jest-server';

module.exports = async () => {
  process.on('warning', e => console.warn(e.stack));
  await MongoTestServer.start();
  process.env.MONGO_URL = await MongoTestServer.getUri();
};
