import { Button } from 'react-bootstrap';
import { ExchangeService, TestService } from '../../open-api';
import { useState } from 'react';
import Error from '../utils/error';


const GeneralAdminTools = () => {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<number>(0);

  const resetNode = async () => {
    setError('');
    setIsWorking(true);
    try {
      await TestService.resetDb();
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
      <h1>General Admin Tools</h1>
      <br/>
      <h3>Reset Database</h3>
      <p>Delete all data in the database and recreate test users.</p>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={resetNode}>
        Full Reset
      </Button>

      <hr/>
      <h3>Test Bitcoin Service</h3>
      <p>Check if the backend Bitcoin & Electrum Nodes are working.</p>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={testBitcoinService}>
        Test Bitcoin Service
      </Button>
      <Error>{error}</Error>
      {result > 0 && <div>Bitcoin Service Test Result: {result}</div>}
    </div>
  );
};

export default GeneralAdminTools;
