import { Button } from 'react-bootstrap';
import ErrorMessage from '../utils/error-message.tsx';
import { ServiceTestResultsDto, TestService } from '../../open-api';
import { getErrorMessage } from '../../utils';
import { useEffect, useState } from 'react';
import ServiceTestResult from './service-test-result.tsx';

const TestBitcoinService = () => {
  const [result, setResult] = useState<ServiceTestResultsDto | null>(null);
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const testBitcoinService = async () => {
    setError('');
    setIsWorking(true);
    setResult(null);
    try {
      setResult(await TestService.testBitcoinService());
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  useEffect(() => {
    testBitcoinService().then();
  }, []);

  return (
    <>
      <h3>Test Bitcoin Services</h3>
      <p>Check if the backend Bitcoin Core and Electrum Nodes are operating.</p>
      <div style={{margin: '10px'}}>
        <ErrorMessage errorMessage={error}/>
        <ServiceTestResult result={result?.bitcoinCoreMainnet} name="Bitcoin Core Mainnet"/>
        <ServiceTestResult result={result?.bitcoinCoreTestnet} name="Bitcoin Core Testnet"/>
        <ServiceTestResult result={result?.electrumxMainnet} name="Elextrum-X Mainnet"/>
        <ServiceTestResult result={result?.electrumxTestnet} name="Elextrum-X Testnet"/>
      </div>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={testBitcoinService}>
        Test Bitcoin Services
      </Button>
    </>
  );
};

export default TestBitcoinService;
