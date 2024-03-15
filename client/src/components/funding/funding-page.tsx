import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore } from '../../store/use-funding-store';
import BigButton from '../utils/big-button.tsx';
import { useEffect } from 'react';
import ButtonPanel from '../utils/button-panel';
import ErrorMessage from '../utils/error-message';
import PendingSubmission from './pending-submission.tsx';
import { Spin } from 'antd';
import FundingAddressTable from './funding-address-table.tsx';
import FundingInfoRow from './funding-info-row.tsx';

const FundingPage = () => {
  const {
    isProcessing,
    isWorking,
    errorMessage,
    clearFundingErrorMessage,
    mode,
    setMode,
    cancelPending,
    fundingSubmissionStatus
  } = useFundingStore();

  useEffect(() => {
    clearFundingErrorMessage();
  }, []);

  if (isWorking) {
    return <div>Loading.. {mode}.</div>;
  }

  if (mode === 'showForm') {
    return <FundingSubmissionForm/>;

  } else if (mode === 'showCurrent') {
    return (
      <>
        <h1>On-Chain Funding{isProcessing ? <Spin style={{marginLeft: 20}}/> : null}</h1>
        <FundingInfoRow/>
        <FundingAddressTable/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={() => setMode('showForm')}>Import CSV</BigButton>
          {isProcessing ?
            <BigButton onClick={() => setMode('showPending')}>Show Pending</BigButton> : null}
        </ButtonPanel>
      </>
    );
  } else {
    return (
      <>
        <h2>Pending Funding{isProcessing ? <Spin style={{marginLeft: 20}}/> : null}</h2>
        <hr/>
        <div style={{maxWidth: 600}}>
          <p>{isProcessing ? 'Please wait while we check the balance.' : null}</p>
          <p>{(!isProcessing && (fundingSubmissionStatus?.numberOfFailedAddresses ?? -1) > 0) ? 'Your most recent submission has failed addresses.' : null}</p>
        </div>
        <PendingSubmission/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={() => setMode('showForm')}>Update</BigButton>
          {/*{!!currentSubmission ? <BigButton onClick={() => setMode('showCurrent')}>Show Current</BigButton> : null}*/}
          <BigButton onClick={() => setMode('showCurrent')}>Show Current</BigButton>
          {isProcessing ? <BigButton onClick={cancelPending}>Cancel</BigButton> : null}
        </ButtonPanel>
      </>
    );
  }
};

export default FundingPage;
