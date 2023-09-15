import { Bip84Utils } from './bip84-utils';
import { exchangeMnemonic } from './exchange-mnemonic';
import moment from 'moment';
import { BitcoinService, Transaction } from './bitcoin.service';
import { TestLoggerService } from "../utils/logging";
import { Network } from '@bcr/types';
import { ElectrumBitcoinService } from '../electrum-api';
import { ApiConfigService } from '../api-config';

jest.setTimeout(99999999);

function findAddress(tx: Transaction, address: string): string {
  const finds: string[] = [];
  tx.inputs
    .filter(a => a.address === address)
    .forEach(input => {
      finds.push('input: ' + input.value);
    });
  tx.outputs
    .filter(a => a.address === address)
    .forEach(output => {
      finds.push('output: ' + output.value);
    });
  return finds.reduce((result, find) => {
    if (result === '') {
      return find;
    }
    return result + ', ' + find;
  }, '');
}

async function extractTransactionsFromAccount(account0: Bip84Utils, bcService: BitcoinService) {

  let walletBalance = 0;
  let outputTable = '';

  for (let i = 0; i < 20; i++) {
    const address = account0.getAddress(i, false);
    const addressBalance = await bcService.getAddressBalance(address);
    walletBalance += addressBalance;
    const txs = await bcService.getTransactionsForAddress(address);
    outputTable += `${address}`;
    if (txs.length > 0) {
      outputTable += '\n';
      txs.forEach(tx => {
        outputTable += (`\t${moment(tx.blockTime).format('MM/DD/YYYY HH:mm')} ${tx.txid} ${findAddress(tx, address)} bal ${addressBalance}\n`);
      });
    } else {
      outputTable += ` No tx ${addressBalance}\n`;
    }
  }
  console.log('Wallet Balance', walletBalance);
  console.log(outputTable);
}

describe('bip84', () => {

  const bcService = new ElectrumBitcoinService(Network.testnet, new TestLoggerService(), {
    electrumTestnetUrl: 'ws://18.170.107.186:50010'
  } as ApiConfigService);

  test('bip84', async () => {
    const account1 = Bip84Utils.fromMnemonic(exchangeMnemonic);
    await extractTransactionsFromAccount(account1, bcService);
  });

  test('find all txs in test wallet', async () => {
    const account0 = Bip84Utils.fromMnemonic(exchangeMnemonic);

    const addresses = new Set();
    for (let i = 0; i < 20; i++) {
      const address = account0.getAddress(i, false );
      addresses.add(address);
    }

    const txs = [
      '04a63371cabdfa81c67e6b8fe38a56aa2350e02918da634955933a05fc19ddba',
      '5f8f5a1eae91e168d1c8c8e98709435d9b8a1e4757f780091fadcb6870cbf517',
      '7ad05a670a5ade7389d940cc002085f17c240c02ea0943e0652be7e6916a52f6',
      '76c9d2daba868d62be0d1bec0defa32bca39571c9001e25bb155d7345d202e36',
      'ee95de20a5a8cce24162ea7e1d85b5c9d29d5404743401a9c2163c9bbd911e5f',
      '79499c3e7d656251f9d8ad19251a2b934e52d07d5c3857bb376c95ba855ece7f',
      'cf47ea3f04c6d241cb296e721ca4253e22ef25714ba0294ea37d92e659a3bf4c',
      '5fb57c06881d5ffc3ecb5f55d85db096a750bc2dd38b281f356160264c2c7cb6',
      'd486ca2f8f68a132a631dae687851d3dca05a8b5dd0fbfca93d7ac68e3ec8b7e',
      '8d5ddacd30319d4dddf94a382a2cf89138b6645e8d1b9b2eab985786bc64664b'
    ];

    for (const txid of txs) {
      const tx = await bcService.getTransaction(txid);
      let foundAddress = false;
      for (const input of tx.inputs) {
        if (addresses.has(input.address)) {
          foundAddress = true;
        }
      }
      for (const output of tx.outputs) {
        if (addresses.has(output.address)) {
          foundAddress = true;
        }
      }

      if (foundAddress) {
        console.log('Address found');
      } else {
        console.log('Address not found');
      }
    }
  });

  test.skip('check all the balances in an xpub', async () => {
    const account0 = Bip84Utils.fromMnemonic(exchangeMnemonic);
    let walletBalance = 0;
    let output = '';
    for (let i = 0; i < 17; i++) {
      const address = account0.getAddress(i, false);
      const addressBalance = await bcService.getAddressBalance(address);
      if (addressBalance > 0) {
        walletBalance += addressBalance;
        output += `${address} ${addressBalance} received\n`;
      }

      const changeAddress = account0.getAddress(i, true);
      const changeAddressBalance = await bcService.getAddressBalance(changeAddress);
      if (changeAddressBalance > 0) {
        walletBalance += changeAddressBalance;
        output += `${address}=${changeAddressBalance} change\n`;
      }
    }
    output = `Balance: ${walletBalance}\n\n` + output;
    console.log(output);
    expect(walletBalance).toBe(768556);
  });

});
