import { Socket } from 'socket.io-client';
import { Node, NetworkService } from '../open-api';
import { Table } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import ErrorMessage from './error-message';

export interface NodeTableProps {
  socket: Socket;
}

const NodeTable = ({ socket }: NodeTableProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    getNodes().then();

    socket.on('nodes', nodes => {
      setNodes(nodes);
    });

    return () => {
      socket.off('nodes');
    };
  }, []); // eslint-disable-line

  const getNodes = async () => {
    setError('');
    try {
      setNodes(await NetworkService.getNodes());
      console.log(nodes);
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
  };

  const renderRow = (node: Node, index: number) =>
    <tr key={node.address}>
      <td>{index + 1}</td>
      <td>{node.name}</td>
      <td>{node.address}</td>
      <td>{node.isLocal ? 'Yes' : 'No'}</td>
    </tr>;

  const renderTable = () =>
    <Table striped bordered hover>
      <thead>
      <tr key="header">
        <th>#</th>
        <th>Name</th>
        <th>Address</th>
        <th>Local</th>
      </tr>
      </thead>
      <tbody>
      {nodes ? nodes.map((p, i) => renderRow(p, i)) : null}
      </tbody>
    </Table>;

  return (
    <>
      <h3>Nodes</h3>
      <ErrorMessage>{error}</ErrorMessage>
      {renderTable()}
    </>
  );
};

export default NodeTable;
