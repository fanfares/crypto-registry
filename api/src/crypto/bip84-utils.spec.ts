import { exchangeMnemonic, registryMnemonic, testnetRegistryZpub } from './exchange-mnemonic';
import { Bip84Utils } from './bip84-utils';
import { Network } from '@bcr/types';

describe('bip84 generate address', () => {

  const registryZpub = Bip84Utils.zpubFromMnemonic(registryMnemonic);
  const exchangeZpub = Bip84Utils.zpubFromMnemonic(exchangeMnemonic);

  const results = [
    'tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u',
    'tb1qurge6erkrqd4l9ca2uvgkgjddz0smrq5nhg72u',
    'tb1q7n9ypse0gth6fxu9u4z3u08shu48aqw809a85r',
    'tb1quvkcnqtw35ye74yu8x6xm3ld3c3dd4xgjt9a9a'
  ];

  test('generate first four addresses', () => {
    const bip84 = new Bip84Utils(registryZpub);
    for (let i = 0; i < 4; i++) {
      expect(bip84.getAddress(i, false)).toBe(results[i]);
    }
  });

  test('generate first change address for test exchange', () => {
    const bip84 = new Bip84Utils(exchangeZpub);
    expect(bip84.getAddress(1, false)).toBe('tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul');
  });

  test('print mainnet exchange zpub', () => {
    const m = 'tide fiscal mention snake diagram silly bottom unique female deliver seat path'
    const account = Bip84Utils.fromMnemonic(m, Network.mainnet)
    console.log('mainnet exchange zpub', account.zpub)
    expect(account.zpub).toBe('zpub6qn3Py6TTmUbm2b7KKsuGdYWHUbk8RkYbrx934sJsLQPZBhMfWZaiHcvdbwqatGDrteBoRxaTJC5NfJrnPJSTgSciQBGyiJxzfmu6BPHiG5')
  })

  test('print mainnet registry zpub', () => {
    const m = 'symbol quick short crush address menu inner disease palace radar survey acid'
    const account = Bip84Utils.fromMnemonic(m, Network.mainnet)
    console.log('mainnet registry zpub', account.zpub)
  })

  test('print registry zpub', () => {
    const account = Bip84Utils.fromMnemonic(registryMnemonic, Network.testnet)
    console.log('Testnet Registry Zpub', account.zpub)
    expect(account.zpub).toBe(testnetRegistryZpub)
  })
});
