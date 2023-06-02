import fs from "fs";
import https from "https";
import axios from "axios";
import * as path from 'path';
import os from 'os';

export interface BitcoinCoreRequest {
  method: string,
  params: any[],
  jsonrpc: string,
  id: string,
}

export async function bitcoinCoreHttpRequest<T>(
  walletName: string,
  request: BitcoinCoreRequest
): Promise<T | any> {

  // curl -k --user robertporter:Helicopter2
  // --data-binary '{"jsonrpc": "1.0", "id": "curltest", "method": "getbalances", "params": []}' -H 'content-type: text/plain;'
  // https://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com/wallet/exchange

// Read the CA certificate file into a Buffer
  const caCrt = fs.readFileSync(path.join(os.homedir(), '.certs', 'bitcoin.crt'));

// Create an httpsAgent with the CA
  const httpsAgent = new https.Agent({ca: caCrt});

  const url = "https://ec2-18-170-107-186.eu-west-2.compute.amazonaws.com/wallet/" + walletName;
  const headers = {'Content-Type': 'application/json'};

  const response = await axios.post(url, request, {
    headers: headers,
    httpsAgent,
    auth: {
      username: 'robertporter',
      password: 'Helicopter2',
    },
  });

  return response.data.result;
}
