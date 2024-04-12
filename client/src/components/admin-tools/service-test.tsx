import {
  type Network,
  ServiceTestResultDto,
  type ServiceType,
  TestService
} from '../../open-api';
import ErrorMessage from '../utils/error-message.tsx';
import { getErrorMessage } from '../../utils';
import { useCallback, useEffect, useState } from 'react';
import { hyphenatedToRegular } from '../utils/enum.tsx';

export type ServiceTestProps = {
  serviceType: ServiceType;
  network: Network;
  trigger: Date | null,
  statusUpdate: (serviceType: ServiceType, network: Network, isWorking: boolean ) => void
};


const ServiceTest = (
  {serviceType, network, trigger, statusUpdate}: ServiceTestProps
) => {
  const [result, setResult] = useState<ServiceTestResultDto | null>(null);
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const testBitcoinService = useCallback(async () => {
    setError('');
    setIsWorking(true);
    setResult(null);
    statusUpdate(serviceType, network, true);
    try {
      setResult(await TestService.testBitcoinService({serviceType, network}));
    } catch (err) {
      setError(getErrorMessage(err));
    }
    statusUpdate(serviceType, network, false);
    setIsWorking(false);
  }, []);

  useEffect(() => {
    testBitcoinService().then();
  }, [trigger]);

  return (
    <>
      <div>{hyphenatedToRegular(serviceType)} {hyphenatedToRegular(network)}: {isWorking ? 'running...' : result?.passed ? 'ok' : 'failed'}</div>
      {result?.errorMessage ? <ErrorMessage errorMessage={result.errorMessage}/> : null}
      <ErrorMessage errorMessage={error}/>
    </>);
};

export default ServiceTest;
