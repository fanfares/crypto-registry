import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore, useStore } from '../../store';
import BigButton from '../utils/big-button.tsx';
import { useCallback, useEffect } from 'react';
import ButtonPanel from '../utils/button-panel';
import ErrorMessage from '../utils/error-message';
import LiveFundingStatusWidget from './live-funding-status-widget.tsx';
import { Spin } from 'antd';
import FundingAddressTable from './funding-address-table.tsx';
import FundingInfoRow from './funding-info-row.tsx';
import { errorNotification } from '../../utils/notification-utils.ts';

const FundingPage = () => {
  const {
    isProcessing,
    errorMessage,
    clearFundingErrorMessage,
    mode,
    setMode,
    cancelPending,
    fundingStatus,
    refreshExchangeBalances
  } = useFundingStore();

  const {currentExchange} = useStore();

  useEffect(() => {
    clearFundingErrorMessage();
  }, []);

  const handleRefreshExchange = useCallback(async () => {
    try {
      if (currentExchange) {
        await refreshExchangeBalances(currentExchange?._id);
      }
    } catch (err) {
      errorNotification(`${currentExchange?.name} balance refresh`);
    }
  }, []);

  if (mode === 'showForm') {
    return <FundingSubmissionForm/>;

  } else if (mode === 'showCurrent' || mode === 'showPending') {
    return (
      <>
        <h1>On-Chain Funding{isProcessing ? <Spin style={{marginLeft: 20}}/> : null}</h1>
        <FundingInfoRow/>
        <LiveFundingStatusWidget/>
        <p>{(!isProcessing && (fundingStatus?.numberOfFailedAddresses ?? -1) > 0) ? 'Your most recent submission has failed addresses.' : null}</p>
        <FundingAddressTable/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton disabled={isProcessing} onClick={() => setMode('showForm')}>Import CSV</BigButton>
          {!isProcessing ?
            <BigButton disabled={isProcessing} onClick={handleRefreshExchange}>Refresh Balances</BigButton> : null}
          {isProcessing ? <BigButton onClick={cancelPending}>Cancel Pending</BigButton> : null}

        </ButtonPanel>
      </>
    );
  }
};

export default FundingPage;
