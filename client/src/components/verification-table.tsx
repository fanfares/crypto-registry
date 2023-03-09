import { VerificationDto } from '../open-api';
import { Table } from 'react-bootstrap';

export interface VerificationTableProps {
  verifications: VerificationDto[];
}

export const VerificationTable = ({ verifications }: VerificationTableProps) => {

  const renderNoData = () => {
    return <tr>
      <td colSpan={3}>No data</td>
    </tr>;
  };

  const renderRow = (verification: VerificationDto, index: number) =>
    <tr key={index}>
      <td>{index + 1}</td>
      <td>
        <div>{verification.initialNodeAddress}</div>
      </td>
      <td>{verification.selectedNodeAddress}</td>
    </tr>;

  const renderTable = () => (
    <>
      <p>Below is a history of verification request made on this email. The initial node is
        where the request originated. The Email Node is the node that sent the email.</p>
      <Table striped bordered hover>
        <thead>
        <tr key="header">
          <th>#</th>
          <th>Initial Node</th>
          <th>Email Node</th>
        </tr>
        </thead>
        <tbody>
        {verifications && verifications.length > 0 ? verifications.map((v, i) => renderRow(v, i)) : renderNoData()}
        </tbody>
      </Table>
    </>
  );

  return renderTable();
};
