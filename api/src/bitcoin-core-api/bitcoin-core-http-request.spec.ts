import { bitcoinCoreHttpRequest, BitcoinCoreRequest } from './bitcoin-core-http-request';


describe('bitcoin-core-http-request', () => {

  test('get balance', async () => {

    interface WalletBalance {
      mine: {
        trusted: number;
        untrusted_pending: number;
        immature: number;
      }
    }

    const request: BitcoinCoreRequest = {
      method: 'getbalances',
      params: [],
      jsonrpc: '2.0',
      id: 'curltest'
    };

    const walletBalance = await bitcoinCoreHttpRequest<WalletBalance>('exchange', request);
    console.log(walletBalance.mine.trusted)
  })

  test('get transaction', async () => {

    const request: BitcoinCoreRequest = {
      method: 'getrawtransaction',
      params: ['68ed01561c6f0347790fd7118629b5a4aa58cda064799fdd7a883cb4daa832f4', true],
      jsonrpc: '2.0',
      id: 'curltest'
    };

    const result = await bitcoinCoreHttpRequest('exchange', request);
    console.log(JSON.stringify(result, null, 2));

    const prevTxId = result.vin[0].txid;
    const prevTxOut = result.vin[0].vout;

    const previousTxRequest: BitcoinCoreRequest = {
      method: 'getrawtransaction',
      params: [prevTxId, true],
      jsonrpc: '2.0',
      id: 'curltest'
    };

    const prevTx = await bitcoinCoreHttpRequest('exchange', previousTxRequest);
    console.log(JSON.stringify(prevTx, null, 2));

    const sourceAddress = prevTx.vout[prevTxOut].scriptPubKey.address;
    console.log('address', sourceAddress)
  })
})
