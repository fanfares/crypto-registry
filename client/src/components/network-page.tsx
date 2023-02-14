import React, { useEffect, useState } from 'react';
import { NetworkService, NodeDto } from '../open-api';
import io from 'socket.io-client';
import Error from './error';
import NodeTable from './node-table';
import JoinNetwork from './join-network';

const socket = io({
  path: '/event'
});

const NetworkPage = () => {

  const [error, setError] = useState<string>('');
  const [networkNodes, setNetworkNodes] = useState<NodeDto[]>([]);
  const [nodeName, setNodeName] = useState<string>('');
  const [nodeAddress, setNodeAddress] = useState<string>('');

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
      setNodeAddress(networkStatus.address);
      setNodeName(networkStatus.nodeName);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <>
      {networkNodes.length === 1 ?
        <div>
          <JoinNetwork></JoinNetwork>
          <hr />
        </div>
        : null}
      <h3>Network Status</h3>
      <p>Node Name: {nodeName}</p>
      <p>Node Address: {nodeAddress}</p>
      <p>Status: {networkNodes.length === 0 ? 'Loading...' : networkNodes.length === 1 ? 'Not connected' : 'Connected'}</p>
      <hr />
      <Error>{error}</Error>
      <NodeTable nodes={networkNodes} />
    </>
  );
};

export default NetworkPage;
