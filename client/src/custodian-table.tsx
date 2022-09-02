import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import { CustodianService, CustodianDto } from './open-api';

export const CustodianTable = () => {

  const [custodians, setCustodians] = useState<CustodianDto[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setErrorMessage('');
    CustodianService.getCustodians().then(custodians => {
      setCustodians(custodians);
      console.log(custodians);
    }).catch(err => {
      setErrorMessage(err.message);
    });
  }, []);


  return (
    <Table striped bordered hover>
      <thead>
      <tr>
        <th>Custodian</th>
        <th>Public Key</th>
        <th>Status</th>
      </tr>
      </thead>
      <tbody>

      {
        custodians.map(c => (
          <tr key={c._id}>
            <td>{c.custodianName}</td>
            <td>{c.publicKey}</td>
            <td>{c.isRegistered ? 'Registered' : 'Not Registered'}</td>
          </tr>
        ))
      }

      </tbody>
    </Table>
  );
};
