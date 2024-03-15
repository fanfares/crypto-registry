import { useFundingStore } from '../../store/use-funding-store.ts';
import { useEffect } from 'react';
import FundingSubmissionStatusWidget from './funding-submission-status-widget.tsx';

const PendingSubmission = () => {

  const {
    updateSubmissionStatus,
    isProcessing
  } = useFundingStore();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | number;
    if (isProcessing) {
      intervalId = setInterval(() => {
        updateSubmissionStatus().then();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [updateSubmissionStatus, isProcessing]);

  return <FundingSubmissionStatusWidget/>;

};

export default PendingSubmission;
