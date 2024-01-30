import { addressToScriptHash } from './address-to-script-hash';

describe('address to script hash', () => {
  test('bech32', () => {
    const address = 'tb1qwkelsl53gyucj9u56zmldk6qcuqqgvgm0nc92u';
    const scriptHash = addressToScriptHash(address);
    const expectedScriptHash = 'c66a2d395ac30536e06083f411fb20d11d04ebad99a9806681ae0eb5af069036';
    expect(scriptHash).toBe(expectedScriptHash);
  });
});
