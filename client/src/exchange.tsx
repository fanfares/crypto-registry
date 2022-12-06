import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SystemService, SystemConfig } from './open-api';
import { CheckSubmissionsForm } from './check-submissions-form';
import ButtonAnchor from './button-anchor';

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

  return (
    <div>
      <h2>Registration and Payment</h2>
      {errorMessage ? (
        <p>{errorMessage}</p>
      ) : ''}

      <p>To submit to BCR, customers must be registered, and must make a payment to BCR.</p>
      <p>Payment details are:</p>
      <ul>
        <li>Public Key: {systemConfig?.registryKey || 'Loading...'}</li>
        <li>Amount: 0.0001BC</li>
      </ul>
      <CheckSubmissionsForm/>
      <h2>Submission</h2>
      <p>Exchanges may submit customer holdings either:</p>
      <ul>
        <li>via <a href={systemConfig ? systemConfig.docsUrl : ''}>REST API</a></li>
        <li>via <ButtonAnchor onClick={navigateToFileUpload}>File Upload</ButtonAnchor></li>
      </ul>
    </div>
  );
};
