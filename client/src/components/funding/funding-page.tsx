import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore } from '../../store/use-funding-store';
import BigButton from '../utils/big-button.tsx';
import { useEffect } from 'react';
import ButtonPanel from '../utils/button-panel';
import ErrorMessage from '../utils/error-message';
import LiveFundingSubmissionStatusWidget from './live-funding-submission-status-widget.tsx';
import { Spin } from 'antd';
import FundingAddressTable from './funding-address-table.tsx';
import FundingInfoRow from './funding-info-row.tsx';

const FundingPage = () => {
  const {
    isProcessing,
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

  if (mode === 'showForm') {
    return <FundingSubmissionForm/>;

  } else if (mode === 'showCurrent' || mode === 'showPending') {
    return (
      <>
        <h1>On-Chain Funding{isProcessing ? <Spin style={{marginLeft: 20}}/> : null}</h1>
        <LiveFundingSubmissionStatusWidget/>
        <p>{isProcessing ? 'Please wait while we read the balances from the blockchain.' : null}</p>
        <p>{(!isProcessing && (fundingSubmissionStatus?.numberOfFailedAddresses ?? -1) > 0) ? 'Your most recent submission has failed addresses.' : null}</p>
        <FundingInfoRow/>
        <FundingAddressTable/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton
            onClick={() => setMode('showForm')}>Import CSV</BigButton>
          {isProcessing ? <BigButton onClick={cancelPending}>Cancel Pending</BigButton> : null}

        </ButtonPanel>
      </>
    );
  }
};

export default FundingPage;
