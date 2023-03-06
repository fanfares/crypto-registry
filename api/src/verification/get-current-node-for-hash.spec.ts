import { BlockstreamBitcoinService } from '../crypto/blockstream-bitcoin.service';
import { Network } from '@bcr/types';
import { Logger } from '@nestjs/common';
import { getCurrentNodeForHash } from './get-current-node-for-hash';

jest.setTimeout(1000000);

describe('calc random number', () => {
  const svc = new BlockstreamBitcoinService(Network.testnet, new Logger());
  const nodes = 10;

  test('get current node for hash', async () => {
    const blockHash = await svc.getLatestBlock();
    const node = getCurrentNodeForHash(blockHash, nodes);
    expect(node).toBeLessThanOrEqual(node);
  });

  test('get distribution', async () => {
    const heightOfLastBlockStr = await svc.getUrl('/blocks/tip/height');
    const heightOfLastBlock = parseInt(heightOfLastBlockStr);

    const distribution: number[] = [];
    for (let i = 0; i < nodes; i++) distribution[i] = 0;

    for (let i = 0; i < 100; i++) {
      const hashOfPreviousBlock = await svc.getUrl(`/block-height/${heightOfLastBlock - i - 30000}`);
      const selectedNode = getCurrentNodeForHash(hashOfPreviousBlock, nodes);
      distribution[selectedNode]++;
    }

    let out = '';
    for (let i = 0; i < nodes; i++) {
      out += `${i + 1}\t${distribution[i]}\n`;
    }
    console.log(out);
  });


});
