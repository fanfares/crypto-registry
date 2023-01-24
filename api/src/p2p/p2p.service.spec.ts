import { P2pService } from './p2p.service';
import { ApiConfigService } from '../api-config';
import { MockMessageSenderService } from './mock-message-sender.service';
import { Logger } from '@nestjs/common';
import { Message, MessageType } from '@bcr/types';

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
    const logger = new Logger();

    node1 = new P2pService({
      p2pLocalAddress: address1,
      p2pNetworkAddress: null,
      nodeName: 'node-1'
    } as ApiConfigService, messageSender, logger);

    node2 = new P2pService({
      p2pLocalAddress: address2,
      p2pNetworkAddress: address1,
      nodeName: 'node-2'
    } as ApiConfigService, messageSender, logger);

    node3 = new P2pService({
      p2pLocalAddress: address3,
      p2pNetworkAddress: address1,
      nodeName: 'node-3'
    } as ApiConfigService, messageSender, logger);

    messageSender.addNode(node1);
    messageSender.addNode(node2);
    messageSender.addNode(node3);
  });

  test('connect 2 nodes', async () => {
    await node2.requestToJoin();
    expect(node1.nodes.length).toEqual(2);
    expect(node2.nodes.length).toEqual(2);

    expect(node1.nodes).toStrictEqual(
      expect.arrayContaining([{
        name: 'node-2',
        address: address2,
        isLocal: false
      }, {
        name: 'node-1',
        address: address1,
        isLocal: true
      }]));

    expect(node2.nodes).toStrictEqual(
      expect.arrayContaining([{
        name: 'node-2',
        address: address2,
        isLocal: true
      }, {
        name: 'node-1',
        address: address1,
        isLocal: false
      }]));

    expect(node1.messages.length).toBe(3);
    expect(node2.messages.length).toBe(2);

  });

  test('connect 3 nodes', async () => {
    await node2.requestToJoin();
    await node3.requestToJoin();
    expect(node1.nodes.length).toEqual(3);
    expect(node2.nodes.length).toEqual(3);

    expect(node1.nodes).toStrictEqual(expect.arrayContaining([{
      name: 'node-2',
      address: address2,
      isLocal: false
    }, {
      name: 'node-1',
      address: address1,
      isLocal: true
    }, {
      name: 'node-3',
      address: address3,
      isLocal: false
    }]));

    expect(node2.nodes).toStrictEqual(expect.arrayContaining([{
      name: 'node-2',
      address: address2,
      isLocal: true
    }, {
      name: 'node-1',
      address: address1,
      isLocal: false
    }, {
      name: 'node-3',
      address: address3,
      isLocal: false
    }]));

    // todo - assert the message length
    // console.log('Node 1 messages:', node1.messages.length);
    // console.log('Node 2 messages:', node2.messages.length);
    // console.log('Node 3 messages:', node3.messages.length);
  });

  test('broadcast text message', async () => {
    await node2.requestToJoin();
    await node3.requestToJoin();
    const message = Message.createMessage(MessageType.textMessage, 'node-1', 'Hello World');
    await node1.sendBroadcastMessage(message);
    const nodes = [node1, node2, node3];
    nodes.forEach(node => {
      const receivedMessage = node.messages.find(m => m.id === message.id);
      expect(receivedMessage.data).toEqual('Hello World');
    });
  });
});
