import { useFundingStore } from '../../store';
import { useEffect } from 'react';
import FundingStatusWidget from './funding-status-widget.tsx';

const LiveFundingStatusWidget = () => {

  const {
    updateFundingStatus,
    isProcessing
  } = useFundingStore();

  useEffect(() => {
    updateFundingStatus().then()
  }, [isProcessing]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | number;
    if (isProcessing) {
      intervalId = setInterval(() => {
        updateFundingStatus().then();
      }, 10000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [updateFundingStatus, isProcessing]);

  return <FundingStatusWidget/>;

};

export default LiveFundingStatusWidget;
