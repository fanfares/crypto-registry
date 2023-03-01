import { ApiError, NetworkService, NodeDto } from '../open-api';
import { Button, Table } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { MdDelete } from 'react-icons/md';
import { useState } from 'react';
import Error from './error';

export interface NodeTableProps {
  nodes: NodeDto[];
}

const NodeTable = ({ nodes }: NodeTableProps) => {

  const [error, setError] = useState<string>('');

  const removeNode = async (address: string) => {
    try {
      await NetworkService.removeNode({ nodeAddress: address });
    } catch (err) {
      let message = err.message;
      if (err instanceof ApiError) {
        message = err.body.message;
      }
      setError(message);
    }
  };

  const renderRow = (node: NodeDto, index: number) =>
    <tr key={node.address}>
      <td>{index + 1}</td>
      <td>
        <div>{node.address}</div>
        <div style={{ color: 'darkgrey', fontSize: '14px' }}>{node.isLocal ? 'This node' : ''}</div>
      </td>
      <td>{node.publicKey}</td>
      <td>{node.unresponsive ? 'No' : 'Yes'}</td>
      <td>{node.lastSeen ? format(parseISO(node.lastSeen), 'dd/MM/yyyy HH:mm') : '-'}</td>
      <td>
        {!node.isLocal ?
          <Button variant="link">
            <MdDelete onClick={() => removeNode(node.address)}/>
          </Button> : ''}
      </td>
    </tr>;

  const renderTable = () =>
    <Table striped bordered hover>
      <thead>
      <tr key="header">
        <th>#</th>
        <th>Address</th>
        <th>PK</th>
        <th>Responsive</th>
        <th>Last Seen</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody>
      {nodes ? nodes.map((p, i) => renderRow(p, i)) : null}
      </tbody>
    </Table>;

  return (
    <>
      <h4>Nodes</h4>
      {renderTable()}
      <Error>{error}</Error>
    </>
  );
};

export default NodeTable;
