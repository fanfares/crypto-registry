const mongoTestServer = require('./mongo-test-server');

module.exports = async () => {
    process.on('warning', e => console.warn(e.stack));
    await mongoTestServer.start();
    process.env.MONGO_URL = await mongoTestServer.getUri();
};
