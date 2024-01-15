import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore } from '../../store/use-funding-store';
import BigButton from '../utils/big-button';
import FundingSubmission from './funding-submission';
import { useEffect } from 'react';
import ButtonPanel from '../utils/button-panel';
import ErrorMessage from '../utils/error-message';
import { FundingSubmissionStatus } from '../../open-api';
import PendingSubmission from './pending-submission.tsx';
import { useStore } from '../../store';

const FundingPage = () => {
  const {
    isWorking,
    errorMessage,
    mode,
    startUpdate,
    clearUpdate,
    cancelUpdate,
    loadCurrentSubmission,
    pendingSubmission,
    currentSubmission
  } = useFundingStore();

  const {currentExchange} = useStore();

  useEffect(() => {
    loadCurrentSubmission().then();
  }, []);

  if (isWorking) {
    return <div>Loading...</div>;
  }

  if (mode === 'showForm' || !currentSubmission) {
    return (
      <FundingSubmissionForm/>
    );
  } else if (mode === 'showCurrent') {
    return (
      <>
        <h2>Current Funding</h2>
        <hr/>
        <p>This is the current funding submission for {currentExchange?.name}.</p>
        <FundingSubmission submission={currentSubmission}/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={startUpdate}>Update</BigButton>
        </ButtonPanel>
      </>
    );
  } else {
    return (
      <>
        <h2>Pending Funding</h2>
        <hr/>
        <p>This is a pending funding submission for {currentExchange?.name}. Please wait while we check the balance.</p>
        <PendingSubmission/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          {pendingSubmission?.status === FundingSubmissionStatus.RETRIEVING_BALANCES ?
            <BigButton onClick={cancelUpdate}>Cancel</BigButton> : null}
          {pendingSubmission?.status !== FundingSubmissionStatus.RETRIEVING_BALANCES ?
            <BigButton onClick={clearUpdate}>Clear</BigButton> : null}
        </ButtonPanel>
      </>
    );
  }
};

export default FundingPage;
