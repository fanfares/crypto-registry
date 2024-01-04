import { Button } from 'react-bootstrap';
import { ExchangeService, TestService } from '../../open-api';
import { useState } from 'react';
import Error from '../utils/error';
import { SendTestEmail } from './send-test-email';
import { GenerateAddressFile } from '../utils/generate-address-file';
import { CentreLayoutContainer } from '../utils/centre-layout-container';


export const Admin = () => {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  const resetNode = async () => {
    setError('');
    setIsWorking(true);
    try {
      await TestService.resetDb({});
    } catch (err) {
      setError(err.message);
    }
    setIsWorking(false);
  };

  const updateExchangeStatus = async () => {
    setError('');
    setIsWorking(true);
    try {
      await ExchangeService.updateStatus();
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
    }
    setIsWorking(false);
  };

  return (
    <div>
      <GenerateAddressFile/>
      <SendTestEmail/>

      <CentreLayoutContainer>
        <hr/>
        <Button disabled={isWorking}
                style={{margin: 10}}
                onClick={resetNode}>
          Full Reset
        </Button>

        <Button disabled={isWorking}
                style={{margin: 10}}
                onClick={updateExchangeStatus}>
          Update Exchange
        </Button>
        <Button disabled={isWorking}
                style={{margin: 10}}
                onClick={testBitcoinService}>
          Test Bitcoin Service
        </Button>
        <Error>{error}</Error>
        {result > 0 && <div>Bitcoin Service Test Result: {result}</div>}
      </CentreLayoutContainer>
    </div>
  );
};
