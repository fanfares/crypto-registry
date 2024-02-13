import { useHoldingsStore } from '../../store/use-holding-store';
import { HoldingsSubmissionForm } from './holdings-submission-form';
import HoldingsSubmission from './holdings-submission';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import { useEffect } from 'react';
import ErrorMessage from '../utils/error-message';
import { useStore } from '../../store';
import ExchangeStatus from '../exchange/exchange-status.tsx';

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
        <HoldingsSubmissionForm/>
    );
  } else {
    return (
      <>
        <HoldingsSubmission holdingSubmission={currentHoldings}/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={startEdit}>Update</BigButton>
        </ButtonPanel>
        <ExchangeStatus/>
      </>
    );
  }
};

export default HoldingsPage;
