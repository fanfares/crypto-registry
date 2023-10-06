import { Button } from 'react-bootstrap';
import { TestService } from '../open-api';
import { useState } from 'react';
import Error from './error';
import { SendTestEmail } from './admin/send-test-email';
import { getApiErrorMessage } from '../utils/get-api-error-message';
import { GenerateAddressFile } from './generate-address-file';


export const Admin = () => {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  const resetWalletHistory = async () => {
    setError('');
    setIsWorking(true);
    try {
      await TestService.resetWalletHistory();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
    setIsWorking(false);
  };

  const resetNode = async () => {
    setError('');
    setIsWorking(true);
    try {
      await TestService.resetDb({});
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
    setIsWorking(false);
  };

  const testBitcoinService = async () => {
    setError('');
    setIsWorking(true);
    try {
      const balance = await TestService.testBitcoinService('testnet');
      setResult(balance);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
    setIsWorking(false);
  };

  return (
    <div>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={resetWalletHistory}>
        Reset Wallet History
      </Button>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={resetNode}>
        Full Reset
      </Button>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={testBitcoinService}>
        Test Bitcoin Service
      </Button>
      <Error>{error}</Error>
      {result > 0 && <div>Bitcoin Service Test Result: {result}</div>}
      <hr/>
      <SendTestEmail/>
      <hr/>
      <GenerateAddressFile/>
    </div>
  );
};
