import { NodeDto } from '../open-api';
import { Table } from 'react-bootstrap';

export interface NodeTableProps {
  nodes: NodeDto[];
}

const NodeTable = ({ nodes }: NodeTableProps) => {

  const renderRow = (node: NodeDto, index: number) =>
    <tr key={node.address}>
      <td>{index + 1}</td>
      <td>{node.nodeName}</td>
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
      <h4>Nodes</h4>
      {renderTable()}
    </>
  );
};

export default NodeTable;
