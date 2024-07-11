import { ResetService, SystemService, TestService } from '../../open-api';
import { useState } from 'react';
import ErrorMessage from '../utils/error-message.tsx';
import { getErrorMessage } from '../../utils';
import TestBitcoinService from './test-bitcoin-service.tsx';
import Sse from '../sse.tsx';
import TestFundingFile from './test-funding-file.tsx';
import { Button } from 'antd';


const GeneralAdminTools = () => {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [ messages, setMessages ] = useState<string[]>([])

  const logError = async () => {
    await TestService.logError();
  };

  const resetNode = async () => {
    setError('');
    setIsWorking(true);
    try {
      await ResetService.reset();
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  const migrateDb = async () => {
    setError('');
    setIsWorking(true);
    setMessages([])
    try {
      setMessages(await SystemService.migrateDb());
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  return (
    <div>
      <h1>General Admin Tools</h1>
      <hr/>

      <TestBitcoinService/>
      <hr/>

      <h3>Test Logging</h3>
      <Button style={{margin: 10}}
              onClick={logError}>
        Log Error
      </Button>
      <hr/>

      <h3>Reset Database</h3>
      <p>Delete all data in the database and recreate test users.</p>
      <ErrorMessage errorMessage={error}/>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={resetNode}>
        Full Reset
      </Button>
      <hr/>

      <h3>Migrate Database</h3>
      <p>Execute current database migration script.</p>
      <ErrorMessage errorMessage={error}/>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={migrateDb}>
        Migrate Db
      </Button>
      { messages.map(((m, i) => <div key={i} >{m}</div>))}
      <hr/>

      <TestFundingFile/>
      <hr/>

      <Sse/>
      <hr/>
    </div>
  );
};

export default GeneralAdminTools;
