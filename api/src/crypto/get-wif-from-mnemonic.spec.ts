import * as bitcoin from 'bitcoinjs-lib';
import { registryMnemonic } from './exchange-mnemonic';
import { getWifFromMnemonic } from "./get-wif-from-mnemonic";

describe('get-wif-from-mnemonic', () => {
  test('get wif from mnemonic', () => {
    const wif = getWifFromMnemonic(registryMnemonic, 'password', bitcoin.networks.testnet);
    expect(wif).toBe('cTnAZfFGdRpn7Z41ueJipMCE6MDYtBPz7YE4gyzYH8GzijPPxWhq')
  })
});
