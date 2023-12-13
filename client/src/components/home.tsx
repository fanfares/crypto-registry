import { useNavigate } from 'react-router-dom';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import { useStore } from '../store';
import { CentreLayoutContainer } from './centre-layout-container';

export const Home = () => {

  const { institutionName, nodeName } = useStore();
  const navigate = useNavigate();

  return (
    <CentreLayoutContainer>
      <h1>Customer Deposits Registry</h1>

      <p>Welcome to the home of Crypto Compliance. This network allows custodians of
        Bitcoin to prove they are holding all of their customers assets </p>

      <p>This node on the network is called {nodeName} and is operated by {institutionName}.</p>

      <p>If you want to verify your exchange is holding your bitcoin:</p>
      <ButtonPanel>
        <BigButton onClick={() => navigate('verify')}>Verify</BigButton>
      </ButtonPanel>
      <br />

      <p>If you are a custodian who wants to make a file-submission:</p>
      <ButtonPanel>
        <BigButton onClick={() => navigate('submit-file')}>Submit</BigButton>
      </ButtonPanel>
      <br />

      <p>If you are a custodian who wants to check on an existing submission:</p>
      <ButtonPanel>
        <BigButton onClick={() => navigate('check-submission')}>Check</BigButton>
      </ButtonPanel>
      <br />
    </CentreLayoutContainer>

  );
};
