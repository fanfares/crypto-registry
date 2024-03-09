import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore } from '../../store/use-funding-store';
import BigButton from '../utils/big-button.tsx';
import FundingSubmission from './funding-submission';
import { useEffect } from 'react';
import ButtonPanel from '../utils/button-panel';
import ErrorMessage from '../utils/error-message';
import { FundingSubmissionStatus } from '../../open-api';
import PendingSubmission from './pending-submission.tsx';
import { useStore } from '../../store';
import { Spin } from 'antd';
import ExchangeStatus from '../exchange/exchange-status.tsx';

const FundingPage = () => {
  const {
    isProcessing,
    isWorking,
    errorMessage,
    clearFundingErrorMessage,
    mode,
    setMode,
    cancelPending,
    loadCurrentSubmission,
    pendingSubmission,
    currentSubmission
  } = useFundingStore();

  const {currentExchange} = useStore();

  useEffect(() => {
    clearFundingErrorMessage()
    loadCurrentSubmission().then();
  }, []);

  if (isWorking) {
    return <div>Loading...</div>;
  }

  if (mode === 'showForm' || !currentSubmission) {
    return <FundingSubmissionForm/>;

  } else if (mode === 'showCurrent') {
    return (
      <>
        <h2>On-Chain Funding{isProcessing ? <Spin style={{marginLeft: 20}}/> : null}</h2>
        <hr/>
        <h5>Current Funding</h5>
        <div style={{ maxWidth: 600 }}>
        <p>This is the current submission for {currentExchange?.name}. {isProcessing ? 'Your recent submission is still being processed.' : null}</p>
        </div>
        <FundingSubmission submission={currentSubmission}/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={() => setMode('showForm')}>Update</BigButton>
          {pendingSubmission ?
            <BigButton onClick={() => setMode('showPending')}>Show Pending</BigButton> : null}
        </ButtonPanel>
        <ExchangeStatus/>
      </>
    );
  } else {
    return (
      <>
        <h2>Pending Funding{isProcessing ? <Spin style={{marginLeft: 20}}/> : null}</h2>
        <hr/>
        <div style={{maxWidth: 600}}>
          <p>{isProcessing ? 'Please wait while we check the balance.' : null}</p>
          <p>{!isProcessing && (pendingSubmission?.status === FundingSubmissionStatus.FAILED || pendingSubmission?.status === FundingSubmissionStatus.INVALID_SIGNATURES) ? 'Your most recent submission has failed.' : null}</p>
          <p>{!isProcessing && pendingSubmission?.status === FundingSubmissionStatus.CANCELLED ? 'Your most recent submission was cancelled' : null}</p>
        </div>
        <PendingSubmission/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={() => setMode('showForm')}>Update</BigButton>
          {!!currentSubmission ? <BigButton onClick={() => setMode('showCurrent')}>Show Current</BigButton> : null}
          {isProcessing ? <BigButton onClick={cancelPending}>Cancel</BigButton> : null}
        </ButtonPanel>
      </>
    );
  }
};

export default FundingPage;
