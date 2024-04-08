import { Button } from 'react-bootstrap';
import Error from '../utils/error.ts';
import { Network, TestService } from '../../open-api';
import { getErrorMessage } from '../../utils';
import { useEffect, useState } from 'react';

const TestBitcoinService = () => {
  const [testNetResult, setTestNetResult] = useState<number | null>(null);
  const [mainNetResult, setMainNetResult] = useState<number | null >(null);
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const testBitcoinService = async () => {
    setError('');
    setIsWorking(true);
    try {
      setTestNetResult(await TestService.testBitcoinService(Network.TESTNET));
      setMainNetResult(await TestService.testBitcoinService(Network.MAINNET));
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  useEffect(() => {
    testBitcoinService().then()
  }, []);

  return (<>

    <h3>Test Bitcoin Service</h3>
    <p>Check if the backend Bitcoin & Electrum Nodes are working.</p>
    <Button disabled={isWorking}
            style={{margin: 10}}
            onClick={testBitcoinService}>
      Test Bitcoin Service
    </Button>
    <Error>{error}</Error>
    <div>Testnet: {testNetResult === null ? 'TBC' : testNetResult > 0 ? 'ok' : 'failed'}</div>
    <div>Mainnet: {mainNetResult === null ? 'TBC' : mainNetResult > 0 ? 'ok' : 'failed'}</div>
  </>)
}

export default TestBitcoinService
