import { useHoldingsStore } from '../../store/use-holding-store';
import { CentreLayoutContainer } from '../utils/centre-layout-container';
import { HoldingsSubmissionForm } from './holdings-submission-form';
import HoldingsSubmission from './holdings-submission';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import { useEffect } from 'react';
import ErrorMessage from '../utils/error-message';

const HoldingsPage = () => {

  const {
    errorMessage,
    isWorking,
    editMode,
    startEdit,
    currentHoldings,
    loadCurrentHoldings
  } = useHoldingsStore();

  useEffect(() => {
    loadCurrentHoldings().then();
  }, []); //eslint-disable-line

  if ( isWorking ) {
    return <CentreLayoutContainer>Loading...</CentreLayoutContainer>
  }

  if (editMode || !currentHoldings) {
    return (
      <CentreLayoutContainer>
        <HoldingsSubmissionForm/>
      </CentreLayoutContainer>
    );
  } else {
    return (
      <CentreLayoutContainer>
        <HoldingsSubmission holdingSubmission={currentHoldings}/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={startEdit}>Update</BigButton>
        </ButtonPanel>
      </CentreLayoutContainer>
    );
  }
};

export default HoldingsPage;
