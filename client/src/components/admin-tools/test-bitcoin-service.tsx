import { Button } from 'react-bootstrap';
import Error from '../utils/error.ts';
import { TestService } from '../../open-api';
import { getErrorMessage } from '../../utils';
import { useState } from 'react';

const TestBitcoinService = () => {
  const [result, setResult] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const testBitcoinService = async () => {
    setError('');
    setIsWorking(true);
    try {
      const balance = await TestService.testBitcoinService('testnet');
      setResult(balance);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  return (<>

    <h3>Test Bitcoin Service</h3>
    <p>Check if the backend Bitcoin & Electrum Nodes are working.</p>
    <Button disabled={isWorking}
            style={{margin: 10}}
            onClick={testBitcoinService}>
      Test Bitcoin Service
    </Button>
    <Error>{error}</Error>
    {result > 0 && <div>Bitcoin Service Test Result: {result}</div>}
  </>)
}

export default TestBitcoinService
