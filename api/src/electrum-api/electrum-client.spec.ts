import * as net from 'net';
import { ElectrumWsClient } from "./electrum-ws-client";
import { addressToScriptHash } from "./address-to-script-hash";


describe('electrum client', () => {
  const url = 'ws://18.170.107.186:50010'

  test('server.version', async () => {
    const electrum = new ElectrumWsClient(url);

    try {
      await electrum.connect();

      const res = await electrum.send('server.version', [])
      console.log('info:', res);
      electrum.disconnect()

    } catch (err) {
      console.log('failed')
      console.log(err);
      expect(false).toBe(true);
    }
  })


  test('get transaction', async () => {
    const electrum = new ElectrumWsClient(url);
    try {
      await electrum.connect();
      const response = await electrum.send('blockchain.transaction.get', ['88d36154f78b64ac7713e7fcebd00d56fbfe0482aa1fb550376eea91a64fb6ef', true])
      console.log('Tx:', JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true)
    }
  })

  test('get balance', async () => {
    const electrum = new ElectrumWsClient(url);
    try {
      await electrum.connect();
      const address = 'mi9hzMmCBQT7orsKhHtQHhmrJZ9HrXkRru';
      const addressToScript = addressToScriptHash(address)
      const response = await electrum.send('blockchain.scripthash.get_balance', [addressToScript])
      console.log('Tx:', JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true)
    }
  })

  test('net client', (done) => {
    const client = new net.Socket();

    client.connect(50001, '18.170.107.186', function () {
      console.log('Connected');
      client.write('{"id": 1, "method": "server.version", "params": []}\n');
    });

    client.on('data', function (data) {
      console.log('Received: ' + data);
      client.destroy(); // kill client after server's response
    });

    client.on('close', function () {
      console.log('Connection closed');
      done()
    });
  })
})
