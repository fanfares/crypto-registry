import { generateAddress } from './generate-address';
import { testMnemonic } from './test-wallet-mnemonic';
import { getZpubFromMnemonic } from './get-zpub-from-mnemonic';

describe('generate address', () => {

  const zpub = getZpubFromMnemonic(testMnemonic, 'password', 'testnet');

  const results = [
    'tb1qvmzjrvhhqq59kwt3gl5ass0kd06866nj25j6sg',
    'tb1qt5xv27eg2walj9vullvsnmfa7pgx0rqgkmf3rf',
    'tb1qd2w4zd4dus5es4ckatn3sfsf0s6rn67qtskzwj',
    'tb1qzgxjap7vue77xyc2nkgcje8u6jrrzn940u8hul'
  ];
  //
  // const results = [
  //   'tb1q0sc8hk9zpq77d3amg6pl0zd79v8mmq3fmvj254',
  //   'tb1qhkpu4e5pyy438hlfah0gq3gm22hgzr7lak6hwx',
  //   'tb1qgm6kecfy2jtdxfq2cerap3ps2ncxy5tvkvxkc0',
  //   'tb1qcmn9xsmp7c96582kd9as0yxh7fe4t9g2f5stqg'
  // ];

  test('generate four addresses', () => {

    for (let i = 0; i < 4; i++) {
      expect(generateAddress(zpub, i, false)).toBe(results[i]);
    }
  });

  test('generate change address', () => {
    expect(generateAddress(zpub, 5, false)).toBe('tb1q67rwpqseumq2a22f7v6qaxl4nuyw5a2dpr9lma');
  });
});
