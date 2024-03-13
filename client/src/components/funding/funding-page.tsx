import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore } from '../../store/use-funding-store';
import BigButton from '../utils/big-button.tsx';
import { useEffect } from 'react';
import ButtonPanel from '../utils/button-panel';
import ErrorMessage from '../utils/error-message';
import { FundingSubmissionStatus } from '../../open-api';
import PendingSubmission from './pending-submission.tsx';
import { Spin } from 'antd';
import ExchangeFundingStatus from '../exchange/exchange-funding-status.tsx';
import FundingAddressTable from './funding-address-table.tsx';

const FundingPage = () => {
  const {
    isProcessing,
    isWorking,
    errorMessage,
    clearFundingErrorMessage,
    mode,
    setMode,
    cancelPending,
    pendingSubmission,
    currentSubmission
  } = useFundingStore();

  useEffect(() => {
    clearFundingErrorMessage();
  }, []);

  if (isWorking) {
    return <div>Loading...</div>;
  }

  if (mode === 'showForm') {
    return <FundingSubmissionForm/>;

  } else if (mode === 'showCurrent') {
    return (
      <>
        <h1>On-Chain Funding{isProcessing ? <Spin style={{marginLeft: 20}}/> : null}</h1>
        <ExchangeFundingStatus/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={() => setMode('showForm')}>Update</BigButton>
          {pendingSubmission ?
            <BigButton onClick={() => setMode('showPending')}>Show Pending</BigButton> : null}
        </ButtonPanel>
        <div style={{marginTop: '30px'}}>
          <FundingAddressTable/>
        </div>
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
    )
  }
};

export default FundingPage;
