import { useHoldingsStore } from '../../store/use-holding-store';
import { HoldingsSubmissionForm } from './holdings-submission-form';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import { useEffect } from 'react';
import ErrorMessage from '../utils/error-message';
import { useStore } from '../../store';
import ExchangeHoldingsStatus from '../exchange/exchange-holdings-status.tsx';

const HoldingsPage = () => {

  const {
    errorMessage,
    isWorking,
    editMode,
    startEdit,
    currentHoldings,
    loadCurrentHoldings
  } = useHoldingsStore();

  const {
    loadCurrentExchange
  } = useStore()

  useEffect(() => {
    loadCurrentHoldings().then();
    loadCurrentExchange().then();
  }, []); //eslint-disable-line

  if ( isWorking ) {
    return <>Loading...</>
  }

  if (editMode || !currentHoldings) {
    return (
      <>
        <HoldingsSubmissionForm/>
      </>
    );
  } else {
    return (
      <>
        <h1>Customer Balances</h1>
        <hr/>
        <ExchangeHoldingsStatus></ExchangeHoldingsStatus>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={startEdit}>Import CSV</BigButton>
        </ButtonPanel>
      </>
    );
  }
};

export default HoldingsPage;
