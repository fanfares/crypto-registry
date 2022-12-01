import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SystemService, SystemConfig } from './open-api';
import { CheckRegistrationForm } from './check-registration-form';

export const Exchange = () => {
  const navigate = useNavigate();
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const navigateToFileUpload = (e: any) => {
    e.preventDefault();
    navigate('file-upload');
  };

  useEffect(() => {
    setErrorMessage('');
    SystemService.getSystemConfig().then(systemConfig => {
      setSystemConfig(systemConfig);
    }).catch(err => {
      setErrorMessage(err.message);
    });
  }, [errorMessage]);

  const content = `curl -X POST -H "Content-Type: application/json" -d \\
'{ \\
   "customerHoldings": [{ \\
    "publicKey": '<exchange public key> \\,
    "hashedEmail": '<hashed customer email>', \\
    "amount": "<customer balance>" \\
  }] \\
}' \\
${systemConfig?.apiUrl}/custodian/submit-holdings
  `

  return (
    <div>
      <h2>Registration and Payment</h2>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : ''}

      <p>To submit to BCR, customers must be registered, and must make a payment to BCR.</p>
      <p>Payment details are</p>
      <ul>
        <li>Public Key: {systemConfig?.registryKey || 'Loading...'}</li>
        <li>Amount: 0.0001BC</li>
      </ul>
      <CheckRegistrationForm/>
      <h2>Submission</h2>
      <p>Custodians may submit customer holdings either;</p>
      <ul>
        <li>via <a href={systemConfig ? systemConfig.docsUrl : ''}>REST API</a></li>
        <li>via <button onClick={navigateToFileUpload}>File Upload</button></li>
      </ul>
      <h5>Try the REST API</h5>
      <p>Call the API directly with the following curl command:</p>
      <pre>TODO: Form to enter the example data? Cut/paste button?</pre>
      <pre>{content}</pre>

    </div>
  );
};