import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SystemService, SystemConfig } from './open-api';

export const Custodian = () => {
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
   "custodianName": "<exchange name>", \\
   "publicKey": '<exchange public key> \\,
   "customerHoldings": [{ \\
    "hashedEmail": '<hashed customer email>', \\
    "amount": "<customer balance>" \\
  }] \\
}' \\
${systemConfig?.apiUrl}/custodian/submit-holdings
  `

  return (
    <div>
      <h2>Registration</h2>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : ''}

      <p>Custodians may register with BCR by making a bitcoin payment to the following public key</p>
      <ul>
        <li>{systemConfig?.publicKey || 'Loading...'}</li>
      </ul>
      <pre>TODO: Form to check, the payment is there?  Perhaps a QR code?</pre>
      <h2>Submission</h2>
      <p>Custodians may submit customer holdings either;</p>
      <ul>
        <li>via the <a href={systemConfig ? systemConfig.docsUrl : ''}>API</a></li>
        <li>via <a href="#" onClick={navigateToFileUpload}>File Upload</a></li>
      </ul>
      <h3>Try the API</h3>
      <p>Call the API directly with the following curl command:</p>
      <pre>TODO: Form to enter the example data? Cut/paste button?</pre>
      <pre>{content}</pre>

    </div>
  );
};
