import axios from 'axios';
import https from 'https';
import fs from 'fs';

export interface WalletBalance {
  mine: {
    trusted: number;
    untrusted_pending: number;
    immature: number;
  }
}

async function getWalletBalance(walletName: string): Promise<WalletBalance> {

 // curl -k --user robertporter:Helicopter2
  // --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getbalances", "params": []}' -H 'content-type: text/plain;'
  // https://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com/wallet/exchange

// Read the CA certificate file into a Buffer
  const caCrt = fs.readFileSync('/Users/robporter/.certs/bitcoin.crt');

// Create an httpsAgent with the CA
  const httpsAgent = new https.Agent({ ca: caCrt });

  const url = "https://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com/wallet/" + walletName;
  const headers = { 'Content-Type': 'application/json' };
  const data = {
    method: "getbalances",
    params: [],
    jsonrpc: "2.0",
    id: "curltest",
  };

  const response = await axios.post(url, data, {
    headers: headers,
    httpsAgent,
    auth: {
      username: 'robertporter',
      password: 'Helicopter2',
    },
  });

  return response.data.result;
}

describe('bitcoin-core', () => {
  test('get balance', async () => {
    const walletBalance = await getWalletBalance('exchange');
    console.log(walletBalance.mine.trusted)
  })
})
