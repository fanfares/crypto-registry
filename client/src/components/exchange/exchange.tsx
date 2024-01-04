import { useStore, useWebSocket } from '../../store';
import Satoshi from '../utils/satoshi';
import Enum from '../utils/enum';
import DateFormat from '../utils/date-format';
import { useEffect } from 'react';
import { ExchangeDto, VerificationDto } from '../../open-api';
import { calculateSha256Hash } from '../../utils/calculate-sha256-hash';

const Exchange = () => {

  const {currentExchange, setExchange} = useStore();
  const { getSocket } = useWebSocket();

  useEffect(() => {
    getSocket().on('exchange', async (exchange: ExchangeDto) => {
      setExchange(exchange);
    });
  }, []); // eslint-disable-line

  if (!currentExchange) {
    return <>Loading...</>;
  }

  return (
    <>
      <h1>{currentExchange.name}</h1>
      <p>Status: <Enum enumValue={currentExchange.status}/></p>
      <h3>Funding</h3>
      <p>Amount: <Satoshi amount={currentExchange.currentFunds}/></p>
      <p>Source: <Enum enumValue={currentExchange.fundingSource}/></p>
      <p>Imported: <DateFormat dateStr={currentExchange.fundingAsAt}/></p>
      <h3>Holdings</h3>
      <p>Amount: <Satoshi amount={currentExchange.currentHoldings}/></p>
      <p>Imported: <DateFormat dateStr={currentExchange.holdingsAsAt}/></p>
    </>
  );
};

export default Exchange;
