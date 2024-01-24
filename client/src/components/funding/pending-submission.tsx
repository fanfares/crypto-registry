import FundingSubmission from './funding-submission.tsx';
import { useFundingStore } from '../../store/use-funding-store.ts';
import { useEffect } from 'react';
import { FundingSubmissionStatus } from '../../open-api';

const PendingSubmission = () => {

  const {
    pendingSubmission,
    pollPendingSubmission
  } = useFundingStore();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | number;
    if (pendingSubmission?.status === FundingSubmissionStatus.PROCESSING
      || pendingSubmission?.status === FundingSubmissionStatus.WAITING_FOR_PROCESSING) {
      intervalId = setInterval(() => {
        pollPendingSubmission().then();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pendingSubmission]);

  return <FundingSubmission submission={pendingSubmission}/>;

};

export default PendingSubmission;
