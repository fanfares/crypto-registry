import { useFundingStore } from '../../store/use-funding-store.ts';
import { useEffect } from 'react';
import FundingSubmissionStatusWidget from './funding-submission-status-widget.tsx';

const LiveFundingSubmissionStatusWidget = () => {

  const {
    updateSubmissionStatus,
    isProcessing,
  } = useFundingStore();

  useEffect(() => {
    updateSubmissionStatus().then()
  }, [isProcessing]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | number;
    if (isProcessing) {
      intervalId = setInterval(() => {
        updateSubmissionStatus().then();
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [updateSubmissionStatus, isProcessing]);

  return <FundingSubmissionStatusWidget/>;

};

export default LiveFundingSubmissionStatusWidget;
