import { getBlockHashFromHeader } from './get-blockhash-from-header';

describe('get-block-hash-from-header', () => {

  test('single hash', () => {
    const header = '00200020b58cc779b800cd1cbd1acdc52077e77b46d5de7b4a441c5c1e000000000000003ec69d4e6ae3b13b74a737715adf6b2e9d91538943ce5b3e288adeff35856d50492f156650e2261949940772'
    const blockHash = getBlockHashFromHeader(header);
    expect(blockHash).toBe('00000000000000095e71ad599a3f04613da82fcfc1671d3dddaa91cea196b021')
  })

})
