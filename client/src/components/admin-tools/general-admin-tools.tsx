import { Button } from 'react-bootstrap';
import { ResetService } from '../../open-api';
import { useState } from 'react';
import Error from '../utils/error';
import { getErrorMessage } from '../../utils';
import { OpenAPI } from '../../open-api/core';
import TestBitcoinService from './test-bitcoin-service.tsx';


const GeneralAdminTools = () => {
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [downloadError, setDownloadError] = useState<string>('');

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


  const downloadTestFunding = async () => {
    setIsWorking(true);
    setDownloadError('');
    const response = await fetch('/api/tools/test-funding', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OpenAPI.TOKEN}`
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const contentDisposition = response.headers.get('content-disposition');
      let fileName = 'default.txt';
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
        }
      }
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const err = await response.json();
      setDownloadError(err.message);
    }
    setIsWorking(false);
  };

  return (
    <div>
      <h1>General Admin Tools</h1>
      <hr/>

      <TestBitcoinService/>
      <hr/>

      <h3>Reset Database</h3>
      <p>Delete all data in the database and recreate test users.</p>
      <Error>{error}</Error>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={resetNode}>
        Full Reset
      </Button>

      <hr/>
      <h3>Download Test Funding File</h3>
      <Error>{downloadError}</Error>
      <Button disabled={isWorking}
              style={{margin: 10}}
              onClick={downloadTestFunding}>
        Download
      </Button>

    </div>
  );
};

export default GeneralAdminTools;
