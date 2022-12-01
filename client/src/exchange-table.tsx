import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import {ExchangeService, ExchangeDto } from './open-api';
import { useStore } from './store';

export const ExchangeTable = () => {

  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
  const { setErrorMessage } = useStore()

  useEffect(() => {
    setErrorMessage('');
    ExchangeService.getCustodians().then(exchanges => {
      setExchanges(exchanges);
      console.log(exchanges);
    }).catch(err => {
      setErrorMessage(err.message);
    });
  }, [setErrorMessage]);

  return (
    <Table striped bordered hover>
      <thead>
      <tr>
        <th>Exchange</th>
        <th>Key</th>
        <th>Status</th>
      </tr>
      </thead>
      <tbody>

      {
        exchanges.map(c => (
          <tr key={c._id}>
            <td>{c.exchangeName}</td>
            <td>{c.publicKey}</td>
            <td>{c.isRegistered ? 'Registered' : 'Not Registered'}</td>
          </tr>
        ))
      }

      </tbody>
    </Table>
  );
};
