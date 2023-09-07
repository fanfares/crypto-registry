import { ElectrumWsClient } from "./electrum-ws-client";
import { addressToScriptHash } from "./address-to-script-hash";
import { TestLoggerService } from "../utils/logging";

describe('electrum client', () => {
  const url = 'ws://18.170.107.186:50010'

  test('server.version', async () => {
    const electrum = new ElectrumWsClient(url, new TestLoggerService());

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
    const electrum = new ElectrumWsClient(url, new TestLoggerService());
    try {
      await electrum.connect();
      const tx = await electrum.send('blockchain.transaction.get', ['88d36154f78b64ac7713e7fcebd00d56fbfe0482aa1fb550376eea91a64fb6ef', true])
      console.log('Tx:', JSON.stringify(tx, null, 2));
      const inputTx = await electrum.send('blockchain.transaction.get', [tx.vin[0].txid, true])
      console.log('Input Tx:', JSON.stringify(inputTx, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true)
    }
  })

  test('get balance', async () => {
    const electrum = new ElectrumWsClient(url, new TestLoggerService());
    try {
      await electrum.connect();
      const address = 'tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul';
      const scriptHash = addressToScriptHash(address)
      const response = await electrum.send('blockchain.scripthash.get_balance', [scriptHash])
      console.log('Tx:', JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true)
    }
  })

  test('list unspent', async () => {
    const electrum = new ElectrumWsClient(url, new TestLoggerService());
    try {
      await electrum.connect();
      const address = 'tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul';
      const scriptHash = addressToScriptHash(address)
      const response = await electrum.send('blockchain.scripthash.listunspent', [scriptHash])
      console.log('Result:', JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true)
    }
  })

  test('get history', async () => {
    const electrum = new ElectrumWsClient(url, new TestLoggerService());
    try {
      await electrum.connect();
      const address = 'tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul';
      const scriptHash = addressToScriptHash(address)
      const response = await electrum.send('blockchain.scripthash.get_history', [scriptHash])
      console.log('Result:', JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true)
    }
  })
})
