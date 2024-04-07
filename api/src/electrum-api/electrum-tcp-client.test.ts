import { ElectrumTcpClient } from './electrum-tcp-client';
import { addressToScriptHash } from './address-to-script-hash';

describe('electrum-tcp-client', () => {

  test('tcp', async() => {

    const client = new ElectrumTcpClient('18.170.107.186', 50001);

    try {
      await client.connect();
      const testAddress = 'tb1q4vglllj7g5whvngs2vx5eqq45u4lt5u694xc04';
      const res = await client.send('blockchain.scripthash.get_balance', [addressToScriptHash(testAddress)]);
      console.log(res);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      client.close();
    }

  })

})
