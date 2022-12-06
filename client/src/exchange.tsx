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
    const loadConfig = async () => {
      setErrorMessage('');
      setSystemConfig(null);
      try {
        const data = await SystemService.getSystemConfig();
        setSystemConfig(data);
      } catch (err) {
        setErrorMessage(err.message);
      }
    };
    loadConfig();
  }, [errorMessage]);

  return (
    <div>
      <h2>Registration and Payment</h2>
      <CheckSubmissionsForm />
      <br/>
      <h2>Submission</h2>
      <p>Exchanges may submit customer holdings either:</p>
      <ul>
        <li>via <a href={systemConfig ? systemConfig.docsUrl : ''}>REST API</a></li>
        <li>via <ButtonAnchor onClick={navigateToFileUpload}>File Upload</ButtonAnchor></li>
      </ul>
    </div>
  );
};
