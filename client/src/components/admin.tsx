import { Button } from 'react-bootstrap';
import { TestService, ApiError, ChainStatus, VerificationService, SubmissionService } from '../open-api';
import { useState } from 'react';
import Error from './error';
import { SendTestEmail } from './admin/send-test-email';

export const Admin = () => {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [verificationChainStatus, setVerificationChainStatus] = useState<ChainStatus | null>(null);
  const [submissionChainStatus, setSubmissionChainStatus] = useState<ChainStatus | null>(null);

  const verifySubmissionChain = async () => {
    setError('');
    setIsWorking(true);
    try {
      const submissionStatus = await SubmissionService.verifyChain();
      setSubmissionChainStatus(submissionStatus);
    } catch (err) {
      let message = err.message;
      if (err instanceof ApiError) {
        message = err.body.message;
      }
      setError(message);
    }
    setIsWorking(false);
  };

  const verifyVerificationChain = async () => {
    setError('');
    setIsWorking(true);
    try {
      const verificationStatus = await VerificationService.verifyChain();
      setVerificationChainStatus(verificationStatus);
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
      <hr />
      <SendTestEmail />
      <hr />
      <Button disabled={isWorking}
              style={{ margin: 10 }}
              onClick={verifyVerificationChain}>
        Check Verification Chain
      </Button>
      {verificationChainStatus ? <pre>{JSON.stringify(verificationChainStatus)}</pre> : null}
      <Button disabled={isWorking}
              style={{ margin: 10 }}
              onClick={verifySubmissionChain}>
        Check Submissions Chain
      </Button>
      {submissionChainStatus ? <pre>{JSON.stringify(submissionChainStatus)}</pre> : null}
    </div>
  );
};
