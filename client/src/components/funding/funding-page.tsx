import { FundingSubmissionForm } from './funding-submission-form';
import { useFundingStore } from '../../store/use-funding-store';
import BigButton from '../utils/big-button';
import FundingSubmission from './funding-submission';
import { useEffect } from 'react';
import { CentreLayoutContainer } from '../utils/centre-layout-container';
import ButtonPanel from '../utils/button-panel';

const FundingPage = () => {
  const {
    updateMode,
    startUpdate,
    loadCurrentSubmission,
    currentSubmission
  } = useFundingStore();

  useEffect(() => {
    loadCurrentSubmission().then();
  }, []); //eslint-disable-line

  if (updateMode) {
    return (
      <CentreLayoutContainer>
        <FundingSubmissionForm/>
      </CentreLayoutContainer>
    );
  } else {
    return (
      <CentreLayoutContainer>
        <FundingSubmission submission={currentSubmission}/>
        <ButtonPanel>
          <BigButton onClick={startUpdate}>Update</BigButton>
        </ButtonPanel>
      </CentreLayoutContainer>
    );
  }
};

export default FundingPage;
