import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import {ExchangeService, ExchangeDto } from './open-api';

export const ExchangeTable = () => {

  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setErrorMessage('');
    ExchangeService.getCustodians().then(exchanges => {
      setExchanges(exchanges);
      console.log(exchanges);
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
        exchanges.map(c => (
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
