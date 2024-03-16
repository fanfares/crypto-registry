import { ElectrumClient } from './electrum-client';
import { addressToScriptHash } from './address-to-script-hash';
import { TestLoggerService } from '../utils/logging';

describe('electrum client', () => {
  const url = 'ws://18.170.107.186:50010';

  test('server.version', async () => {
    const electrum = new ElectrumClient(url, new TestLoggerService());

    try {
      await electrum.connect();
      const res = await electrum.send('server.version', []);
      console.log('info:', res);
      electrum.disconnect();

    } catch (err) {
      console.log('failed');
      console.log(err);
      expect(false).toBe(true);
    }
  });

  test('get transaction', async () => {
    const electrum = new ElectrumClient(url, new TestLoggerService());
    try {
      await electrum.connect();
      const tx = await electrum.send('blockchain.transaction.get', ['88d36154f78b64ac7713e7fcebd00d56fbfe0482aa1fb550376eea91a64fb6ef', true]);
      console.log('Tx:', JSON.stringify(tx, null, 2));
      const inputTx = await electrum.send('blockchain.transaction.get', [tx.vin[0].txid, true]);
      console.log('Input Tx:', JSON.stringify(inputTx, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true);
    }
  });

  test('get single balance', async () => {
    const electrum = new ElectrumClient(url, new TestLoggerService());
    await electrum.connect();
    const address = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
    const scriptHash = addressToScriptHash(address);
    const data = await electrum.send('blockchain.scripthash.get_balance', [scriptHash]);
    expect(data.confirmed).toBe(778000);
  });

  test('get multiple balances', async () => {
    const electrum = new ElectrumClient(url, new TestLoggerService());
    await electrum.connect();
    const address1 = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
    const address2 = 'my9FapANVaFVbPu5cXcvF18XsstejzARre';
    const data = await electrum.getAddressBalances([address1, address2]);
    expect(data.find(r => r.id === address1).confirmed).toBe(778000);
    expect(data.find(r => r.id === address2).confirmed).toBe(600000);
  });

  test('list unspent', async () => {
    const electrum = new ElectrumClient(url, new TestLoggerService());
    try {
      await electrum.connect();
      const address = 'tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul';
      const scriptHash = addressToScriptHash(address);
      const response = await electrum.send('blockchain.scripthash.listunspent', [scriptHash]);
      console.log('Result:', JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true);
    }
  });

  test('get history', async () => {
    const electrum = new ElectrumClient(url, new TestLoggerService());
    try {
      await electrum.connect();
      const address = 'tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul';
      const scriptHash = addressToScriptHash(address);
      const response = await electrum.send('blockchain.scripthash.get_history', [scriptHash]);
      console.log('Result:', JSON.stringify(response, null, 2));
    } catch (err) {
      console.log(err);
      expect(false).toBe(true);
    }
  });
});
