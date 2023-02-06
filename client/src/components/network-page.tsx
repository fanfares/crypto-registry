import React, { useEffect, useState } from 'react';
import { NetworkService, NodeDto, MessageDto } from '../open-api';
import io from 'socket.io-client';
import ErrorMessage from './error-message';
import MessageTable from './message-table';
import BroadcastMessage from './broadcast-message';
import NodeTable from './node-table';
import JoinNetwork from './join-network';

const socket = io({
  path: '/event'
});

const NetworkPage = () => {

  const [error, setError] = useState<string>('');
  const [networkNodes, setNetworkNodes] = useState<NodeDto[]>([]);
  const [nodeName, setNodeName] = useState<string>('');
  const [messages, setMessages] = useState<MessageDto[]>([]);

  useEffect(() => {
    getNetworkStatus().then();

    socket.on('nodes', nodes => {
      setNetworkNodes(nodes);
    });

    socket.on('messages', messages => {
      setMessages(messages);
    });

    return () => {
      socket.off('messages');
      socket.off('nodes');
    };
  }, []); // eslint-disable-line

  const getNetworkStatus = async () => {
    setError('');
    try {
      const networkStatus = await NetworkService.getNetworkStatus();
      setNetworkNodes(networkStatus.nodes);
      setNodeName(networkStatus.nodeName);
      setMessages(networkStatus.messages);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <>
      {networkNodes.length === 1 ? <JoinNetwork></JoinNetwork> : null}
      <h3>Network Status</h3>
      <p>Node Name: {nodeName}</p>
      <p>Status: {networkNodes.length === 0 ? 'Loading...' : networkNodes.length === 1 ? 'Not connected' : 'Connected'}</p>
      <ErrorMessage>{error}</ErrorMessage>
      <NodeTable nodes={networkNodes} />
      <MessageTable messages={messages} />
      <BroadcastMessage />
    </>
  );
};

export default NetworkPage;
