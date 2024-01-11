import Table from 'react-bootstrap/Table';
import { useEffect, useState } from 'react';
import { ExchangeDto, ExchangeService } from '../../open-api';
import { useStore } from '../../store';
import { getErrorMessage } from '../../utils';

export const ExchangeTable = () => {

  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
  const { setErrorMessage } = useStore();

  useEffect(() => {
    const loadData = async () => {
      setErrorMessage('');
      try {
        const exchanges = await ExchangeService.getAllExchanges();
        setExchanges(exchanges);
      } catch (err) {
        setErrorMessage(getErrorMessage(err));
      }
    };
    loadData();
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
            <td>{c.name}</td>
          </tr>
        ))
      }

      </tbody>
    </Table>
  );
};
