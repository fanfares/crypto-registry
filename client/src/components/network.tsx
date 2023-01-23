import React, { useEffect, useState } from 'react';
import { NetworkService, NodeDto } from '../open-api';
import io from 'socket.io-client';
import BigButton from './big-button';
import ErrorMessage from './error-message';
import ButtonPanel from './button-panel';
import MessageTable from './message-table';
import BroadcastMessage from './broadcast-message';
import NodeTable from './node-table';

const socket = io({
  path: '/event'
});

const Network = () => {

  const [error, setError] = useState<string>('');
  const [networkNodes, setNetworkNodes] = useState<NodeDto[]>([]);
  const [networkName, setNetworkName] = useState<string>('');

  useEffect(() => {
    getNetworkStatus().then();

    socket.on('nodes', nodes => {
      setNetworkNodes(nodes);
    });

    return () => {
      socket.off('nodes');
    };
  }, []); // eslint-disable-line

  const getNetworkStatus = async () => {
    setError('');
    try {
      const networkStatus = await NetworkService.getNetworkStatus();
      setNetworkNodes(networkStatus.nodes);
      setNetworkName(networkStatus.nodeName);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };


  const joinNetwork = async () => {
    try {
      await NetworkService.requestToJoin();
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <>
      <h3>Network Status</h3>
      <p>Network Name: {networkName}</p>
      <ErrorMessage>{error}</ErrorMessage>
      <ButtonPanel>
        <BigButton onClick={joinNetwork}>Join Network</BigButton>
      </ButtonPanel>
      <NodeTable nodes={networkNodes} />
      <MessageTable socket={socket} />
      <BroadcastMessage />
    </>
  );
};

export default Network;
