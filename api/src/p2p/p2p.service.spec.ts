import { P2pService } from './p2p.service';
import { ApiConfigService } from '../api-config';
import { MockMessageSenderService } from './mock-message-sender.service';

describe('p2p-service', () => {

  let node1: P2pService;
  let node2: P2pService;
  let node3: P2pService;
  const address1 = 'node-1';
  const address2 = 'node-2';
  const address3 = 'node-3';
  let messageSender: MockMessageSenderService;

  beforeEach(() => {
    messageSender = new MockMessageSenderService();

    node1 = new P2pService({
      p2pLocalAddress: address1,
      p2pNetworkAddress: null
    } as ApiConfigService, messageSender);

    node2 = new P2pService({
      p2pLocalAddress: address2,
      p2pNetworkAddress: address1
    } as ApiConfigService, messageSender);

    node3 = new P2pService({
      p2pLocalAddress: address3,
      p2pNetworkAddress: address1
    } as ApiConfigService, messageSender);

    messageSender.addNode(node1);
    messageSender.addNode(node2);
    messageSender.addNode(node3);
  });

  test('connect 2 nodes', async () => {
    await node2.onApplicationBootstrap();
    expect(node1.peers.length).toEqual(2);
    expect(node2.peers.length).toEqual(2);

    expect(node1.peers).toStrictEqual(expect.arrayContaining([{
      address: address2
    }, {
      address: address1
    }]));

    expect(node2.peers).toStrictEqual(expect.arrayContaining([{
      address: address2
    }, {
      address: address1
    }]));
  });

  test('connect 3 nodes', async () => {
    await node2.onApplicationBootstrap();
    await node3.onApplicationBootstrap();
    expect(node1.peers.length).toEqual(3);
    expect(node2.peers.length).toEqual(3);

    expect(node1.peers).toStrictEqual(expect.arrayContaining([{
      address: address2
    }, {
      address: address1
    }, {
      address: address3
    }]));

    expect(node2.peers).toStrictEqual(expect.arrayContaining([{
      address: address2
    }, {
      address: address1
    }, {
      address: address3
    }]));

    console.log('Node 1 messages:', node1.messages.length);
    console.log('Node 2 messages:', node2.messages.length);
    console.log('Node 3 messages:', node3.messages.length);
  });
});
