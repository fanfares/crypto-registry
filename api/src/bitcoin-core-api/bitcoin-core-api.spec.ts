import { BitCoinCoreApi } from './bitcoin-core-api';


describe('bitcoin-core-api', () => {

  const baseUrl = 'https://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com'
  const username = 'robertporter';
  const password = 'Helicopter2';
  const crtFileName = 'bitcoin-testnet.crt'
  const bitCoinCoreApi = new BitCoinCoreApi({baseUrl, username, password, crtFileName});

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
      };
    }

    const walletBalance: WalletBalance = await bitCoinCoreApi.execute({
      method: 'getbalances'
    }, 'exchange');

    console.log(walletBalance.mine.trusted);
  });

  test('get best block hash', async () => {
    const result = await bitCoinCoreApi.getBestBlockHash();
    console.log(result);
  });

  test('get block detail', async () => {
    const result = await bitCoinCoreApi.getBlockDetail('000000000002920ac0ce0f0539391b7ccac2c66a3a00729d7df3a3af7727cdb4');
    expect(result.time.toString()).toBe('Sat Mar 02 2024 16:45:53 GMT+0000 (Greenwich Mean Time)')
  });

  test('get transaction', async () => {
    const result = await bitCoinCoreApi.execute({
      method: 'getrawtransaction',
      params: ['68ed01561c6f0347790fd7118629b5a4aa58cda064799fdd7a883cb4daa832f4', true]
    }, 'exchange');
    console.log(JSON.stringify(result, null, 2));

    const prevTxId = result.vin[0].txid;
    const prevTxOut = result.vin[0].vout;

    const prevTx = await bitCoinCoreApi.execute({
      method: 'getrawtransaction',
      params: [prevTxId, true]
    }, 'exchange');
    console.log(JSON.stringify(prevTx, null, 2));

    const sourceAddress = prevTx.vout[prevTxOut].scriptPubKey.address;
    console.log('address', sourceAddress);
  });

});
