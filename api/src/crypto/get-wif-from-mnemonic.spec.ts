import * as bitcoin from 'bitcoinjs-lib';
import { exchangeMnemonic, registryMnemonic } from './exchange-mnemonic';
import { getWifFromMnemonic } from "./get-wif-from-mnemonic";

describe('get-wif-from-mnemonic', () => {
  test('get registry wif from mnemonic', () => {
    const wif = getWifFromMnemonic(registryMnemonic, 'password', bitcoin.networks.testnet);
    expect(wif).toBe('cTnAZfFGdRpn7Z41ueJipMCE6MDYtBPz7YE4gyzYH8GzijPPxWhq')
  })

  test('get exchange wif from mnemonic', () => {
    const wif = getWifFromMnemonic(exchangeMnemonic, 'password', bitcoin.networks.testnet);
    expect(wif).toBe('cV67P6dpCP3JhVYAQ2i9dNRf5BcgUkEgU2gHiq3VqzRrLuPdNNZ8')
  })
});
