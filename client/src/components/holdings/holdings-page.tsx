import { useHoldingsStore } from '../../store/use-holding-store';
import { CentreLayoutContainer } from '../utils/centre-layout-container';
import { HoldingsSubmissionForm } from './holdings-submission-form';
import HoldingsSubmission from './holdings-submission';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';

const HoldingsPage = () => {

  const {
    editMode,
    startEdit,
    currentHoldings
  } = useHoldingsStore();

  if (editMode) {
    return (
      <CentreLayoutContainer>
        <p>Edit Mode</p>
        <HoldingsSubmissionForm/>
      </CentreLayoutContainer>
    );
  } else {
    return (
      <CentreLayoutContainer>
        <HoldingsSubmission holdingSubmission={currentHoldings}/>
        <ButtonPanel>
          <BigButton onClick={startEdit}>Update</BigButton>
        </ButtonPanel>
      </CentreLayoutContainer>
    );
  }
};

export default HoldingsPage;
