import { Network, ServiceType } from '../../open-api';
import { useEffect, useState } from 'react';
import ServiceTest from './service-test.tsx';
import { Button } from 'antd';

const TestBitcoinService = () => {
  const [trigger, setTrigger] = useState<Date | null>(null);
  const [, setWorkingStatus] = useState<boolean[]>([true, true, true, true]);
  const [isTesting, setIsTesting] = useState(false);

  const testBitcoinService = async () => {
    setTrigger(new Date());
  };

  const statusUpdate = (serviceType: ServiceType, network: Network, isWorking: boolean) => {
    const serviceTypeIndex = serviceType === ServiceType.BITCOIN_CORE ? 0 : 2;
    const mainnetIndex = network === Network.MAINNET ? 0 : 1;
    const index = mainnetIndex + serviceTypeIndex;

    setWorkingStatus((prevStatus) => {
      const updatedStatus = [...prevStatus];
      updatedStatus[index] = isWorking;
      return updatedStatus;
    });
    setWorkingStatus((prevStatus) => {
      const totalWorking = prevStatus.reduce((t, status) => t + (status ? 1 : 0), 0);
      setIsTesting(totalWorking > 0);
      return prevStatus;
    });
  };

  useEffect(() => {
    setTrigger(new Date());
  }, []);

  return (
    <>
      <h3>Test Bitcoin Services</h3>
      <p>Check if the backend Bitcoin Core and Electrum-X Services are operating normally.</p>
      <div style={{margin: '10px'}}>
        <ServiceTest statusUpdate={statusUpdate} trigger={trigger} serviceType={ServiceType.BITCOIN_CORE}
                     network={Network.MAINNET}/>
        <ServiceTest statusUpdate={statusUpdate} trigger={trigger} serviceType={ServiceType.BITCOIN_CORE}
                     network={Network.TESTNET}/>
        <ServiceTest statusUpdate={statusUpdate} trigger={trigger} serviceType={ServiceType.ELECTRUM_X}
                     network={Network.MAINNET}/>
        <ServiceTest statusUpdate={statusUpdate} trigger={trigger} serviceType={ServiceType.ELECTRUM_X}
                     network={Network.TESTNET}/>
      </div>
      <Button
        disabled={isTesting}
        style={{margin: 10}}
        onClick={testBitcoinService}>
        Test Bitcoin Services
      </Button>
    </>
  );
};

export default TestBitcoinService;
