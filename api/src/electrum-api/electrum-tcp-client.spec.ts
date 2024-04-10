import { addressToScriptHash } from './address-to-script-hash';
import { ElectrumTcpClient } from './electrum-tcp-client';
import { getTestFunding } from '../bitcoin-service/get-test-funding';
import { exchangeVprv } from '../crypto';
import { MockBitcoinService } from '../bitcoin-service/mock-bitcoin.service';
import { wait } from '../utils';
import { getBlockHashFromHeader } from './get-blockhash-from-header';
import { ElectrumRequest } from './electrum-ws-client';

jest.setTimeout(10000000);

describe('electrum tcp client', () => {
  const electrum = new ElectrumTcpClient('ssl://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com:50002', '.certs/electrumx-testnet.crt');

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
    // console.log('Tx:', JSON.stringify(tx, null, 2));
    const inputTx = await electrum.send('blockchain.transaction.get', [tx.vin[0].txid, true]);
    // console.log('Input Tx:', JSON.stringify(inputTx, null, 2));
  });

  test('get single balance', async () => {
    const address = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
    const scriptHash = addressToScriptHash(address);
    let data = await electrum.send('blockchain.scripthash.get_balance', [scriptHash]);
    await electrum.send('blockchain.scripthash.get_balance', [scriptHash]);
    data = await electrum.send('blockchain.scripthash.get_balance', [scriptHash]);
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

  test('send-multiple timeout', async () => {
    const data = await getTestFunding(exchangeVprv, new MockBitcoinService(null), 20);
    let receivedError = false;
    try {
      await electrum.sendMultiple(data.map(a => ({
        id: a.address,
        method: 'blockchain.scripthash.get_balance',
        params: [addressToScriptHash(a.address)]
      })), 10);
    } catch (err) {
      receivedError = true;
    }
    expect(receivedError).toBe(true);
  });

  test('list unspent', async () => {
    const address = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
    const scriptHash = addressToScriptHash(address);
    const response = await electrum.send('blockchain.scripthash.listunspent', [scriptHash]);
    expect(response[0].value).toBe(778000);
  });

  test('get history', async () => {
    const address = 'tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul';
    const scriptHash = addressToScriptHash(address);
    const response = await electrum.send('blockchain.scripthash.get_history', [scriptHash]);
    // console.log('Result:', JSON.stringify(response, null, 2));
  });

  test('get balance', async () => {
    const testAddress = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
    const res = await electrum.send('blockchain.scripthash.get_balance', [addressToScriptHash(testAddress)]);
    expect(res.confirmed).toBe(778000);
  });

  test('block/tip/hash', async () => {
    const res = await electrum.send('blockchain.headers.subscribe', []);
    const blockHash = getBlockHashFromHeader(res.hex);
    expect(blockHash).toBeDefined();
  });

  test('block detail', async () => {
    const res = await electrum.send('blockchain.block.header', [2585746]);
    expect(res).toBe('00200020b58cc779b800cd1cbd1acdc52077e77b46d5de7b4a441c5c1e000000000000003ec69d4e6ae3b13b74a737715adf6b2e9d91538943ce5b3e288adeff35856d50492f156650e2261949940772');
  });
});
