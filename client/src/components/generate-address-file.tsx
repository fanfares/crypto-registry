import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../store';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import Input from './input';
import { FloatingLabel } from 'react-bootstrap';
import { CentreLayoutContainer } from './centre-layout-container';
import { Network, OpenAPI } from '../open-api';
import MyErrorMessage from './error-message';
import { ErrorMessage } from '@hookform/error-message';
import InputWithCopyButton from './input-with-copy-button';

interface Inputs {
  zprv: string;
}

export const GenerateAddressFile = () => {

  const {validateExtendedKey, isWorking, signingMessage, updateSigningMessage} = useStore();
  const [localIsWorking, setLocalIsWorking] = useState(false);

  const {
    handleSubmit,
    register,
    formState: {isValid, errors}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  useEffect(() => {
    updateSigningMessage().then()
  }, []);

  const [network, setNetwork] = React.useState<Network | null>(null);
  const [error, setError] = React.useState<string>('');

  const handleSubmission = async (data: Inputs) => {
    setLocalIsWorking(true);
    setError('');
    const response = await fetch('/api/test/generate-test-address-file', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OpenAPI.TOKEN}`
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      // Use the filename from the Content-Disposition header or provide a default
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
      const err = await response.json()
      setError(err.message);
    }
    setLocalIsWorking(false);
  };

  return (
    <CentreLayoutContainer>
      <h1>Generate Address File</h1>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30, display: 'flex', flexDirection: 'column'}}>
          <FloatingLabel label="Exchange Private Key">
            <Form.Control
              type="text"
              isInvalid={!!errors?.zprv}
              placeholder="Extended Private Key (zpub)"
              {...register('zprv', {
                required: 'Private Key is required',
                validate: async zpub => {
                  setError('');
                  const result = await validateExtendedKey(zpub);
                  if (result.valid) {
                    if ( !result.isPrivate ) {
                      return 'This is not a private key';
                    }
                    setNetwork(result.network ?? null);
                    return true;
                  } else {
                    setNetwork(null);
                    return 'Invalid Private key';
                  }
                }
              })} />

            <Form.Text className="text-muted">
              Extended Private Key of a Native Segwit Wallet containing the customer funds (see <a
              href="https://river.com/learn/terms/b/bip-84-derivation-paths-for-native-segwit/">BIP84</a> for more info)
            </Form.Text>

          </FloatingLabel>

          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="zprv"/>
          </Form.Text>

        </div>

        <div style={{marginBottom: 30}}>
          <InputWithCopyButton text={signingMessage || ''} label="Signing Message"></InputWithCopyButton>
          <Form.Text className="text-muted">
            Name of the institution holding customer funds
          </Form.Text>
        </div>

        {network ?
          <div style={{marginBottom: 30}}>
            <FloatingLabel
              label="Network">
              <Input type="text"
                     disabled={true}
                     value={network}/>
              <Form.Text className="text-muted">
                The network for this Submission.
              </Form.Text>
            </FloatingLabel>
          </div> : null}

        <div>
          <MyErrorMessage errorMessage={error}/>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking || localIsWorking}
                       type="submit">
              {localIsWorking ? 'Generating...' : 'Generate'}
            </BigButton>
          </ButtonPanel>
        </div>
      </Form>
    </CentreLayoutContainer>
  );
};
