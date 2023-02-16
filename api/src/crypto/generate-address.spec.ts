import { generateAddress } from './generate-address';
import { exchangeMnemonic, registryMnemonic } from './exchange-mnemonic';
import { Bip84Account } from './bip84-account';

describe('generate address', () => {

  const registryZpub = Bip84Account.zpubFromMnemonic(registryMnemonic);
  const exchangeZpub = Bip84Account.zpubFromMnemonic(exchangeMnemonic);

  const results = [
    'tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u',
    'tb1qurge6erkrqd4l9ca2uvgkgjddz0smrq5nhg72u',
    'tb1q7n9ypse0gth6fxu9u4z3u08shu48aqw809a85r',
    'tb1quvkcnqtw35ye74yu8x6xm3ld3c3dd4xgjt9a9a'
  ];

  test('generate first four addresses', () => {
    for (let i = 0; i < 4; i++) {
      expect(generateAddress(registryZpub, i, false)).toBe(results[i]);
    }
  });

  test('generate first change address for test exchange', () => {
    expect(generateAddress(exchangeZpub, 1, false)).toBe('tb1qa9tu36jc2jxu0s53x6fpumjr30ascpjf6kdrul');
  });
});
