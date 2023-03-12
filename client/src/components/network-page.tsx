import React, { useEffect, useState } from 'react';
import { NetworkService, NodeDto } from '../open-api';
import io from 'socket.io-client';
import Error from './error';
import NodeTable from './node-table';
import JoinNetwork from './join-network';
import PingNetwork from './ping-network';
import { useWebSocket } from '../store/use-web-socket';

// const socket = io({ path: '/api/event'});

const NetworkPage = () => {

  const [error, setError] = useState<string>('');
  const [networkNodes, setNetworkNodes] = useState<NodeDto[]>([]);
  const [nodeName, setNodeName] = useState<string>('');
  const [nodeAddress, setNodeAddress] = useState<string>('');
  const [ count, setCount] = useState<number|null>(null)
  const { getSocket } = useWebSocket();

  useEffect(() => {
    getNetworkStatus().then();

    getSocket().on('nodes', nodes => {
      setNetworkNodes(nodes);
    });

    getSocket().on('count', (count) => {
      setCount(count)
    })

    return () => {
      getSocket().off();
    };
  }, []);

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
      <h3>Network Status</h3>
      <p>Count: {count || '-'}</p>
      <p>Node Name: {nodeName}</p>
      <p>Node Address: {nodeAddress}</p>
      <p>Status: {networkNodes.length === 0 ? 'Loading...' : networkNodes.length === 1 ? 'Not connected' : 'Connected'}</p>
      <PingNetwork></PingNetwork>
      <hr />
      <Error>{error}</Error>
      <NodeTable nodes={networkNodes} />
      <hr />
      <JoinNetwork></JoinNetwork>
      <hr />
    </>
  );
};

export default NetworkPage;
