import { generateAddress } from './generate-address';
import { testMnemonic } from './test-wallet-mnemonic';
import { generateBIP84ExtendedPublicKey } from './generate-bip84-extended-public-key';

describe('generate address', () => {

  const results = [
    'tb1q0sc8hk9zpq77d3amg6pl0zd79v8mmq3fmvj254',
    'tb1qhkpu4e5pyy438hlfah0gq3gm22hgzr7lak6hwx',
    'tb1qgm6kecfy2jtdxfq2cerap3ps2ncxy5tvkvxkc0',
    'tb1qcmn9xsmp7c96582kd9as0yxh7fe4t9g2f5stqg'
  ];

  test('generate four addresses', () => {
    const testExtendedPublicKey = generateBIP84ExtendedPublicKey(testMnemonic);

    for (let i = 0; i < 4; i++) {
      expect(generateAddress(testExtendedPublicKey, i)).toBe(results[i]);
    }
  });
});
