import { VerificationDto } from '../open-api';
import { Table } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';

export interface VerificationTableProps {
  verifications: VerificationDto[];
}

export const VerificationTable = ({ verifications }: VerificationTableProps) => {

  const renderNoData = () => {
    return <tr>
      <td colSpan={4}>No data</td>
    </tr>;
  };

  const renderRow = (verification: VerificationDto, index: number) =>
    <tr key={index}>
      <td>{format(parseISO(verification.requestDate), 'dd/MM/yyyy HH:mm')}</td>
      <td>
        <div>{verification.receivingAddress}</div>
      </td>
      <td>{verification.leaderAddress}</td>
      <td>{verification.status}</td>
    </tr>;

  const renderTable = () => (
    <>
      <p>Below is a history of verification request made on this email. The initial node is
        where the request originated. The Email Node is the node that sent the email.</p>
      <Table striped bordered hover>
        <thead>
        <tr key="header">
          <th>Requested Date/Time</th>
          <th>Initial Node</th>
          <th>Email Sender Node</th>
          <th>Status</th>
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
