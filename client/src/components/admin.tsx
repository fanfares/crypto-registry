import { Button } from 'react-bootstrap';
import { TestService, ApiError, ChainStatus, VerificationService } from '../open-api';
import { useState } from 'react';
import Error from './error';
import { SendTestEmail } from './admin/send-test-email';

export const Admin = () => {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null)

  const verifyVerificationChain = async () => {
    setError('');
    setIsWorking(true);
    try {
      const status = await VerificationService.verifyChain();
      setChainStatus(status)
    } catch (err) {
      let message = err.message;
      if (err instanceof ApiError) {
        message = err.body.message;
      }
      setError(message);
    }
    setIsWorking(false);
  };

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

  const resetNode = async () => {
    setError('');
    setIsWorking(true);
    try {
      await TestService.resetDb({});
    } catch (err) {
      let message = err.message;
      if (err instanceof ApiError) {
        message = err.body.message;
      }
      setError(message);
    }
    setIsWorking(false);
  };

  return (
    <div>
      <Error>{error}</Error>
      <Button disabled={isWorking}
              style={{ margin: 10 }}
              onClick={resetWalletHistory}>
        Reset Wallet History
      </Button>
      <Button disabled={isWorking}
              style={{ margin: 10 }}
              onClick={resetNode}>
        Full Reset
      </Button>
      <hr/>
      <SendTestEmail />
      <hr/>
      <Button disabled={isWorking}
              style={{ margin: 10 }}
              onClick={verifyVerificationChain}>
        Verify Chain
      </Button>
      { chainStatus ? <pre>{JSON.stringify(chainStatus)}</pre> : null }
    </div>
  );
};
