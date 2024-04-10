import { ElectrumTcpClient } from './electrum-tcp-client';
import { TestLoggerService } from '../utils/logging';
import { addressToScriptHash } from './address-to-script-hash';
import { getBlockHashFromHeader } from './get-blockhash-from-header';

describe('electrum-tcp-client', () => {

  const client = new ElectrumTcpClient('ssl://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com:50002', '.certs/electrumx-testnet.crt');

  beforeAll(async () => {
    await client.connect();
  });

  afterAll(async () => {
    client.disconnect();

  });

  test('get balance', async () => {
    const testAddress = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
    const res = await client.send('blockchain.scripthash.get_balance', [addressToScriptHash(testAddress)]);
    expect(res.confirmed).toBe(778000);
  });

  test('block/tip/hash', async () => {
    const res = await client.send('blockchain.headers.subscribe', []);
    const blockHash = getBlockHashFromHeader(res.hex);
    expect(blockHash).toBeDefined();
  });

  test('block detail', async () => {
    const res = await client.send('blockchain.block.header', [2585746]);
    console.log(res);
  });

});
