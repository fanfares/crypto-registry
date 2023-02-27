import { NodeDto } from '../open-api';
import { Table } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

export interface NodeTableProps {
  nodes: NodeDto[];
}

const NodeTable = ({ nodes }: NodeTableProps) => {

  const renderRow = (node: NodeDto, index: number) =>
    <tr key={node.address}>
      <td>{index + 1}</td>
      <td>
        <div>{node.address}</div>
        <div style={{ color: 'darkgrey', fontSize: '14px' }}>{node.isLocal ? 'This node' : ''}</div>
      </td>
      <td>{node.unresponsive ? 'No' : 'Yes'}</td>
      <td>{node.lastSeen ? format(parseISO(node.lastSeen), 'dd/MM/yyyy HH:mm') : '-'}</td>
    </tr>;

  const renderTable = () =>
    <Table striped bordered hover>
      <thead>
      <tr key="header">
        <th>#</th>
        <th>Address</th>
        <th>Responsive</th>
        <th>Last Seen</th>
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
    </>
  );
};

export default NodeTable;
