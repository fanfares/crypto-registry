import { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import Input from '../utils/input';
import { FloatingLabel } from 'react-bootstrap';
import MyErrorMessage from '../utils/error-message';
import { ErrorMessage } from '@hookform/error-message';
import InputWithCopyButton from '../utils/input-with-copy-button';
import { BitcoinService, Network, SignAddressResultDto } from '../../open-api';
import { useFundingStore } from '../../store/use-funding-store';
import { getErrorMessage } from '../../utils';

interface Inputs {
  privateKey: string;
  change: boolean;
  index: number;
}

const SignatureGenerator = () => {

  const {validateExtendedKey, isWorking} = useStore();
  const {signingMessage, updateSigningMessage} = useFundingStore();

  const [localIsWorking, setLocalIsWorking] = useState(false);

  const {
    handleSubmit,
    register,
    formState: {isValid, errors}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  useEffect(() => {
    updateSigningMessage().then();
  }, []); // eslint-disable-line

  const [network, setNetwork] = useState<Network | null>(null);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<SignAddressResultDto | null>(null);

  const handleSubmission = async (data: Inputs) => {
    setLocalIsWorking(true);
    setError('');
    try {

      const result = await BitcoinService.signAddress({
        index: data.index,
        change: data.change,
        privateKey: data.privateKey,
        message: signingMessage ?? ''
      });
      setResult(result);
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    }
    setLocalIsWorking(false);
  };

  return (
    <>
      <h1>Signature Generator</h1>
      <p>Use this utility to generate the signature for an address.</p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30, display: 'flex', flexDirection: 'column'}}>
          <FloatingLabel label="Exchange Private Key">
            <Form.Control
              style={{maxWidth: '600px'}}
              type="text"
              isInvalid={!!errors?.privateKey}
              placeholder="Extended Private Key (zpub)"
              {...register('privateKey', {
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
            <ErrorMessage errors={errors} name="privateKey"/>
          </Form.Text>

        </div>

        <div>
          <FloatingLabel label="Address Index">
            <Form.Control
              style={{maxWidth: '600px'}}
              type="number"
              isInvalid={!!errors?.index}
              placeholder="Address Index"
              {...register('index', {
                required: 'Index is required'
              })} />

            <Form.Text className="text-muted">
              Index of Address
            </Form.Text>

          </FloatingLabel>

          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="index"/>
          </Form.Text>

        </div>

        <div>
          <Form.Check
            disabled
            type="checkbox"
            label="Change Address"
            {...register('change')}
          />

          <Form.Text className="text-muted">
            Check for change addresses
          </Form.Text>

        </div>

        <div style={{marginBottom: 30}}>
          <InputWithCopyButton text={signingMessage || ''} label="Signing Message"></InputWithCopyButton>
          <Form.Text className="text-muted">
            Message to be signed.
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

        {
          result ? <>
            <p>{ result.address }</p>
            <p>{ result.network }</p>
            <p>{ result.signature }</p>
            <p>{ result.derivationPath }</p>
          </> : null
        }
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
    </>
  );
};

export default SignatureGenerator;
