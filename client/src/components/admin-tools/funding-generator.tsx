import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import Input from '../utils/input';
import { FloatingLabel } from 'react-bootstrap';
import { OpenAPI } from '../../open-api/core';
import MyErrorMessage from '../utils/error-message';
import { ErrorMessage } from '@hookform/error-message';
import { BitcoinService, Network } from '../../open-api';
import { useFundingStore } from '../../store/use-funding-store';
import InputWithUpdateButton from '../utils/input-with-update-button.tsx';

interface Inputs {
  extendedPrivateKey: string;
  message: string;
}

const FundingGenerator = () => {

  const {validateExtendedKey, isWorking} = useStore();
  const {signingMessage, updateSigningMessage} = useFundingStore();
  const [localIsWorking, setLocalIsWorking] = useState(false);

  const {
    handleSubmit,
    register,
    formState: {isValid, errors},
    setValue
  } = useForm<Inputs>({
    mode: 'onBlur',
    defaultValues: {
      message: signingMessage ?? ''
    }
  });

  useEffect(() => {
    updateSigningMessage().then();
  }, []); // eslint-disable-line

  const updateBlockForSignatureMessage = async () => {
    const latestBlockHash = await BitcoinService.getLatestBlock(Network.TESTNET);
    setValue('message', latestBlockHash.hash);
  };

  const [network, setNetwork] = useState<Network | null>(null);
  const [error, setError] = useState<string>('');

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
      const err = await response.json();
      setError(err.message);
    }
    setLocalIsWorking(false);
  };

  return (
    <>
      <h1>Funding Generator</h1>
      <p>Use this utility to generate a funding file from your private key. This utility should only be used for testing
        only.</p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30, display: 'flex', flexDirection: 'column'}}>
          <FloatingLabel label="Extended Private Key">
            <Form.Control
              style={{maxWidth: '1000px'}}
              type="text"
              isInvalid={!!errors?.extendedPrivateKey}
              placeholder="Extended Private Key (zpub)"
              {...register('extendedPrivateKey', {
                required: 'Private Key is required',
                validate: async zpub => {
                  setError('');
                  const result = await validateExtendedKey(zpub);
                  if (result.valid) {
                    if (!result.isPrivate) {
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
            <ErrorMessage errors={errors} name="extendedPrivateKey"/>
          </Form.Text>

        </div>

        <div style={{marginBottom: 30}}>
          <InputWithUpdateButton
            updateFn={() => updateBlockForSignatureMessage()}
            register={register('message', {
              required: 'Message is required'
            })}
            subtext="Block to use for signature message"
            label="Signature Block"/>
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
            <BigButton disabled={!isValid}
                       loading={isWorking || localIsWorking}
                       htmlType="submit">
              {localIsWorking ? 'Generating...' : 'Generate'}
            </BigButton>
          </ButtonPanel>
        </div>
      </Form>
    </>
  );
};

export default FundingGenerator;
