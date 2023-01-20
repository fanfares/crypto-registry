import React, { useEffect, useState } from 'react';
import { NetworkService, Peer } from '../open-api';
import { Table } from 'react-bootstrap';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import ErrorMessage from './error-message';

const Network = () => {

  const [error, setError] = useState<string>('');
  const [peers, setPeers] = useState<Peer[]>([]);

  useEffect(() => {
    getPeers().then();
  }, []); // eslint-disable-line

  const getPeers = async () => {
    setError('');
    try {
      setPeers(await NetworkService.getPeers());
    } catch (err) {
      console.log(err)
      setError(err.message);
    }
  };

  const joinNetwork = async () => {
    try {
      await NetworkService.join();
    } catch (err) {
      console.log(err)
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

  return (
    <>
      <h1>Network</h1>
      <ErrorMessage>{error}</ErrorMessage>
      <ButtonPanel>
        <BigButton onClick={joinNetwork}>Join Network</BigButton>
      </ButtonPanel>
      {renderPeerTable()}
    </>
  );
};

export default Network;
