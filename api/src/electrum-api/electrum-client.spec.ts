import { ElectrumClient, ElectrumRequest } from './electrum-client';
import { addressToScriptHash } from './address-to-script-hash';
import { TestLoggerService } from '../utils/logging';
import { getTestFunding } from '../bitcoin-service/get-test-funding';
import { exchangeVprv } from '../crypto';
import { MockBitcoinService } from '../bitcoin-service/mock-bitcoin.service';

jest.setTimeout(10000);

describe('electrum client', () => {
  const url = 'ws://18.170.107.186:50010';
  const electrum = new ElectrumClient(url, new TestLoggerService());

  beforeAll(async () => {
    await electrum.connect();
  });

  afterAll(async () => {
    electrum.disconnect();
  });


  test('server.version', async () => {
    const res = await electrum.send('server.version', []);
    expect(res).toBeDefined();
  });

  test('get transaction', async () => {
    const tx = await electrum.send('blockchain.transaction.get', ['88d36154f78b64ac7713e7fcebd00d56fbfe0482aa1fb550376eea91a64fb6ef', true]);
    console.log('Tx:', JSON.stringify(tx, null, 2));
    const inputTx = await electrum.send('blockchain.transaction.get', [tx.vin[0].txid, true]);
    console.log('Input Tx:', JSON.stringify(inputTx, null, 2));
  });

  test('get single balance', async () => {
    const address = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
    const scriptHash = addressToScriptHash(address);
    const data = await electrum.send('blockchain.scripthash.get_balance', [scriptHash]);
    expect(data.confirmed).toBe(778000);
  });

  test('send multiple', async () => {
    const address1 = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
    const request1: ElectrumRequest = {
      id: address1,
      method: 'blockchain.scripthash.get_balance',
      params: [addressToScriptHash(address1)]
    };

    const address2 = 'my9FapANVaFVbPu5cXcvF18XsstejzARre';
    const request2: ElectrumRequest = {
      id: address2,
      method: 'blockchain.scripthash.get_balance',
      params: [addressToScriptHash(address2)]
    };

    const data = await electrum.sendMultiple([request1, request2]);
    expect(data.find(r => r.id === address1).confirmed).toBe(778000);
    expect(data.find(r => r.id === address2).confirmed).toBe(600000);
  });

  test('timeout', async () => {
    const data = await getTestFunding(exchangeVprv, new MockBitcoinService(null, null), 20);
    expect(() => electrum.sendMultiple(data.map(a => ({
      id: a.address,
      method: 'blockchain.scripthash.get_balance',
      params: [addressToScriptHash(a.address)]
    })), 10))
    .rejects.toThrow('electrum - get-address-balances - timed out');
  });

  test('list unspent', async () => {
    const address = 'tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul';
    const scriptHash = addressToScriptHash(address);
    const response = await electrum.send('blockchain.scripthash.listunspent', [scriptHash]);
    console.log('Result:', JSON.stringify(response, null, 2));
  });

  test('get history', async () => {
    const address = 'tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul';
    const scriptHash = addressToScriptHash(address);
    const response = await electrum.send('blockchain.scripthash.get_history', [scriptHash]);
    console.log('Result:', JSON.stringify(response, null, 2));
  });
});
