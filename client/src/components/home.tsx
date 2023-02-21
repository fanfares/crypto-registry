import { useNavigate } from 'react-router-dom';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import { useStore } from '../store';

export const Home = () => {

  const { institutionName, nodeName } = useStore();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Crypto Registry Network</h1>

      <p>Welcome to the home of Crypto Compliance. This network allows custodians of
        Crypto Currencies to prove they are holding all of their customers assets </p>

      <p>This node on the network is called {nodeName} and is operated by {institutionName}.</p>

      <p>If you want to verify your exchange is holding your crypto:</p>
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
    </div>

  );
};
