import ButtonPanel from './button-panel';
import { Button } from 'react-bootstrap';
import { TestService, ApiError } from '../open-api';
import { useState } from 'react';
import Error from './error';

export const Admin = () => {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const resetWalletHistory = async () => {
    setError('');
    setIsWorking(true);
    try {
      await TestService.resetWalletHistory();
    } catch (err) {
      let message = err.message;
      if (err instanceof ApiError) {
        message = err.body.message;
      }
      setError(message);
    }
    setIsWorking(false);
  };

  return (<>
    <ButtonPanel>
      <Error>{error}</Error>
      <Button disabled={isWorking}
              onClick={resetWalletHistory}>
        Reset Wallet History
      </Button>
    </ButtonPanel>
  </>);
};
