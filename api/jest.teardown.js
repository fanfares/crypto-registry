const mongoTestServer = require('./mongo-test-server');

module.exports = async () => {
    await mongoTestServer.stop();
};
