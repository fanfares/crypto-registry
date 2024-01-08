import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore } from '../../store/use-funding-store';
import BigButton from '../utils/big-button';
import FundingSubmission from './funding-submission';
import { useEffect } from 'react';
import { CentreLayoutContainer } from '../utils/centre-layout-container';
import ButtonPanel from '../utils/button-panel';
import ErrorMessage from '../utils/error-message';

const FundingPage = () => {
  const {
    isWorking,
    errorMessage,
    updateMode,
    startUpdate,
    loadCurrentSubmission,
    currentSubmission
  } = useFundingStore();

  useEffect(() => {
    loadCurrentSubmission().then();
  }, []); //eslint-disable-line

  if ( isWorking ) {
    return <CentreLayoutContainer>Loading...</CentreLayoutContainer>
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
