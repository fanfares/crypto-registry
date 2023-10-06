import React from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../store';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import Input from './input';
import { FloatingLabel } from 'react-bootstrap';
import { CentreLayoutContainer } from './centre-layout-container';
import { Network, OpenAPI } from '../open-api';
import { getApiErrorMessage } from '../utils/get-api-error-message';
import MyErrorMessage from './error-message';
import { ErrorMessage } from '@hookform/error-message';

interface Inputs {
  zpub: string;
}

export const GenerateAddressFile = () => {

  const {validateExtendedKey, isWorking} = useStore();

  const {
    handleSubmit,
    register,
    formState: {isValid, errors}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  const [network, setNetwork] = React.useState<Network | null>(null);
  const [error, setError] = React.useState<string>('');


  const handleSubmission = async (data: Inputs) => {
    try {
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
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  return (
    <CentreLayoutContainer>
      <h1>Generate Address File</h1>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30, display: 'flex', flexDirection: 'column'}}>
          <FloatingLabel label="Exchange Private Key">
            <Form.Control
              type="text"
              isInvalid={!!errors?.zpub}
              placeholder="Extended Private Key (zpub)"
              {...register('zpub', {
                required: 'Private Key is required',
                validate: async zpub => {
                  const result = await validateExtendedKey(zpub);
                  if (result.valid) {
                    setNetwork(result.network ?? null);
                    return true;
                  } else {
                    setNetwork(null);
                    return 'Invalid Private key';
                  }
                }
              })} />
          </FloatingLabel>

          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="zpub"/>
          </Form.Text>

          <Form.Text className="text-muted">
            Extended Private Key of a Native Segwit Wallet containing the customer funds (see <a
            href="https://river.com/learn/terms/b/bip-84-derivation-paths-for-native-segwit/">BIP84</a> for more info)
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
            <BigButton disabled={!isValid || isWorking}
                       type="submit">
              {isWorking ? 'Generating...' : 'Generate'}
            </BigButton>
          </ButtonPanel>
        </div>
      </Form>
    </CentreLayoutContainer>
  );
};
