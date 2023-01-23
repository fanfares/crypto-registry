import React, { useEffect, useState } from 'react';
import { NetworkService, Peer } from '../open-api';
import { Table } from 'react-bootstrap';
import io from 'socket.io-client';
import BigButton from './big-button';
import ErrorMessage from './error-message';
import ButtonPanel from './button-panel';
import MessageTable from './message-table';
import BroadcastMessage from './broadcast-message';

const socket = io({
  path: '/event'
});

const Network = () => {

  const [error, setError] = useState<string>('');
  const [peers, setPeers] = useState<Peer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [count, setCount] = useState<number | null>(0);

  useEffect(() => {
    getPeers().then();

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('count', count => {
      setCount(count);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('nodes', nodes => {
      setPeers(nodes);
    });

    return () => {
      socket.off('count');
      socket.off('nodes');
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []); // eslint-disable-line

  const getPeers = async () => {
    setError('');
    try {
      setPeers(await NetworkService.getPeers());
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  const joinNetwork = async () => {
    try {
      await NetworkService.join();
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  const renderPeerRow = (peer: Peer, index: number) =>
    <tr key={peer.address}>
      <td>{index + 1}</td>
      <td>{peer.address}</td>
      <td>{peer.isLocal ? 'Yes' : 'No'}</td>
    </tr>;

  const renderPeerTable = () =>
    <Table striped bordered hover>
      <thead>
      <tr key="header">
        <th>#</th>
        <th>Address</th>
        <th>Local</th>
      </tr>
      </thead>
      <tbody>
      {peers.map((p, i) => renderPeerRow(p, i))}
      </tbody>
    </Table>;

  const reset = () => {
    setCount(null);
    socket.emit('reset', new Date());
  };

  return (
    <>
      <p>Proxy: {process.env.REACT_APP_PROXY_HOST}</p>
      {isConnected ? 'Connected' : 'Disconnected'}
      <p>Count: {count ? count : '-'}</p>
      <BigButton onClick={reset}>Reset</BigButton>
      <ErrorMessage>{error}</ErrorMessage>
      <ButtonPanel>
        <BigButton onClick={joinNetwork}>Join Network</BigButton>
      </ButtonPanel>
      <h3>Nodes</h3>
      {renderPeerTable()}
      <MessageTable socket={socket}/>
      <BroadcastMessage/>
    </>
  );
};

export default Network;
