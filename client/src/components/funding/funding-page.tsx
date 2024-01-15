import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore } from '../../store/use-funding-store';
import BigButton from '../utils/big-button';
import FundingSubmission from './funding-submission';
import { useEffect } from 'react';
import { CentreLayoutContainer } from '../utils/centre-layout-container';
import ButtonPanel from '../utils/button-panel';
import ErrorMessage from '../utils/error-message';
import { FundingSubmissionStatus } from '../../open-api';

const FundingPage = () => {
  const {
    isWorking,
    errorMessage,
    updateMode,
    startUpdate,
    loadCurrentSubmission,
    pendingSubmission,
    currentSubmission
  } = useFundingStore();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | number;

    if (!currentSubmission || (pendingSubmission && pendingSubmission.status === FundingSubmissionStatus.RETRIEVING_BALANCES)) {
      intervalId = setInterval(() => {
        loadCurrentSubmission().then();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentSubmission, loadCurrentSubmission]);


  if (isWorking) {
    return <CentreLayoutContainer>Loading...</CentreLayoutContainer>;
  }

  if (updateMode || !currentSubmission) {
    return (
      <FundingSubmissionForm/>
    );
  } else {
    return (
      <>
        <FundingSubmission submission={currentSubmission}/>
        <ErrorMessage errorMessage={errorMessage}/>
        <ButtonPanel>
          <BigButton onClick={startUpdate}>Update</BigButton>
        </ButtonPanel>
      </>
    );
  }
};

export default FundingPage;
