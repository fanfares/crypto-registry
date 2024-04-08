import { Button } from 'react-bootstrap';
import Error from '../utils/error.ts';
import { ServiceTestResultDto, TestService } from '../../open-api';
import { getErrorMessage } from '../../utils';
import { useEffect, useState } from 'react';

const TestBitcoinService = () => {
  const [result, setResult] = useState<ServiceTestResultDto | null >(null);
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const testBitcoinService = async () => {
    setError('');
    setIsWorking(true);
    try {
      setResult(await TestService.testBitcoinService());
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  useEffect(() => {
    testBitcoinService().then()
  }, []);

  return (<>

    <h3>Test Bitcoin Services</h3>
    <p>Check if the backend Bitcoin Core and Electrum Nodes are operating.</p>
    <Button disabled={isWorking}
            style={{margin: 10}}
            onClick={testBitcoinService}>
      Test Bitcoin Services
    </Button>
    <Error>{error}</Error>
    <div>Bitcoin Core Mainnet: {result === null ? 'TBC' : result.bitcoinCoreMainnet ? 'ok' : 'failed'}</div>
    <div>Bitcoin Core Testnet: {result === null ? 'TBC' : result.bitcoinCoreTestnet ? 'ok' : 'failed'}</div>
    <div>Electrum-X Mainnet: {result === null ? 'TBC' : result.electrumxMainnet ? 'ok' : 'failed'}</div>
    <div>Electrum-X Testnet: {result === null ? 'TBC' : result.electrumxTestnet ? 'ok' : 'failed'}</div>
  </>)
}

export default TestBitcoinService
