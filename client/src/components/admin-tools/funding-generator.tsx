import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import Input from '../utils/input';
import { FloatingLabel } from 'react-bootstrap';
import MyErrorMessage from '../utils/error-message';
import { ErrorMessage } from '@hookform/error-message';
import { BitcoinService, Network } from '../../open-api';
import InputWithUpdateButton from '../utils/input-with-update-button.tsx';
import { downloadFile } from '../utils/download-file.ts';
import { getErrorMessage } from '../../utils';

interface Inputs {
  extendedPrivateKey: string;
  message: string;
}

const FundingGenerator = () => {

  const {validateExtendedKey, isWorking} = useStore();
  const [localIsWorking, setLocalIsWorking] = useState(false);

  const {
    handleSubmit,
    register,
    formState: {isValid, errors},
    setValue,
    watch
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  const extendedKey = watch('extendedPrivateKey')
  const [network, setNetwork] = useState<Network | null>(null);
  const [error, setError] = useState<string>('');

  const updateBlockForSignatureMessage = async () => {
    if (network) {
      const latestBlockHash = await BitcoinService.getLatestBlock(network);
      setValue('message', latestBlockHash.hash);
    }
  };

  useEffect(() => {
    if ( (!errors.extendedPrivateKey && !!extendedKey)) {
      updateBlockForSignatureMessage().then();
    }
  }, [extendedKey, network]);

  const handleSubmission = async (data: Inputs) => {
    setLocalIsWorking(true);
    setError('');
    try {
      await downloadFile('/api/tools/generate-test-address-file', 'post', data)
    } catch ( err ) {
      setError(getErrorMessage(err));
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
            disabled={!network}
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
