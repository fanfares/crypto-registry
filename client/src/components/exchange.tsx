import { useNavigate } from 'react-router-dom';
import { CheckSubmission } from './check-submission';
import ButtonAnchor from './button-anchor';
import { useStore } from '../store';
import React from 'react';

export const Exchange = () => {
  const navigate = useNavigate();
  const { docsUrl } = useStore();

  const navigateToFileUpload = () => {
    navigate('file-upload');
  };

  return (
    <div>
      <CheckSubmission />
      <br />
      <h2>Submission</h2>
      <p>Exchanges may submit customer holdings either:</p>
      <ul>
        <li>via <a href={docsUrl}>REST API</a></li>
        <li>via <ButtonAnchor onClick={navigateToFileUpload}>File Upload</ButtonAnchor></li>
      </ul>
    </div>
  );
};
