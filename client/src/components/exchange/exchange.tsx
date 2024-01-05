import { useStore } from '../../store';
import Satoshi from '../utils/satoshi';
import Enum from '../utils/enum';
import DateFormat from '../utils/date-format';
import { useEffect } from 'react';

const Exchange = () => {

  const {currentExchange, isWorking, loadCurrentExchange} = useStore();

  useEffect(() => {
    loadCurrentExchange().then();
  }, []);

  if ( isWorking ) {
    return <>Loading...</>;
  }

  if (!currentExchange) {
    return <>There is no exchange associated with this user</>;
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
