import { BitCoinCoreApi } from './bitcoin-core-api';


describe('bitcoin-core-api', () => {

  const baseUrl = 'https://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com'
  const username = 'robertporter';
  const password = 'Helicopter2';
  const bitCoinCoreApi = new BitCoinCoreApi({ baseUrl, username, password });

  test('get wallet info', async () => {

    const result = await bitCoinCoreApi.execute({
      method: 'getwalletinfo',
    });
    console.log(result)
  })

  test('get balance', async () => {

    interface WalletBalance {
      mine: {
        trusted: number;
        untrusted_pending: number;
        immature: number;
      }
    }

    const walletBalance: WalletBalance = await bitCoinCoreApi.execute({
      method: 'getbalances',
    }, 'exchange',);

    console.log(walletBalance.mine.trusted)
  })

  test('get best block hash', async () => {
    const result = await bitCoinCoreApi.execute({
      method: 'getbestblockhash',
    });
    console.log(result)
  })

  test('get transaction', async () => {
    const result = await bitCoinCoreApi.execute({
      method: 'getrawtransaction',
      params: ['68ed01561c6f0347790fd7118629b5a4aa58cda064799fdd7a883cb4daa832f4', true],
    }, 'exchange');
    console.log(JSON.stringify(result, null, 2));

    const prevTxId = result.vin[0].txid;
    const prevTxOut = result.vin[0].vout;

    const prevTx = await bitCoinCoreApi.execute({
      method: 'getrawtransaction',
      params: [prevTxId, true],
    }, 'exchange');
    console.log(JSON.stringify(prevTx, null, 2));

    const sourceAddress = prevTx.vout[prevTxOut].scriptPubKey.address;
    console.log('address', sourceAddress)
  })
})
