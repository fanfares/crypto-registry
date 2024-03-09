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
import { BitcoinService, Network, SignatureGeneratorResultDto, ToolsService } from '../../open-api';
import { useFundingStore } from '../../store/use-funding-store';
import { getErrorMessage } from '../../utils';
import { formatSatoshi } from '../utils/satoshi.tsx';
import InputWithUpdateButton from '../utils/input-with-update-button.tsx';
import { formatDate } from '../utils/date-format.tsx';

interface Inputs {
  privateKey: string;
  address: string;
  maxIndex: string;
  message: string;
}

const SignatureGenerator = () => {

  const {validateExtendedKey, isWorking} = useStore();
  const {signingMessage, updateSigningMessage} = useFundingStore();

  const [localIsWorking, setLocalIsWorking] = useState(false);

  const {
    handleSubmit,
    register,
    setValue,
    formState: {isValid, errors}
  } = useForm<Inputs>({
    mode: 'onBlur',
    defaultValues: {
      maxIndex: '1000',
      message: signingMessage ?? ''
    }
  });

  useEffect(() => {
    updateSigningMessage().then();
  }, []); // eslint-disable-line

  const [network, setNetwork] = useState<Network | null>(null);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<SignatureGeneratorResultDto | null>(null);

  const handleSubmission = async (data: Inputs) => {
    setLocalIsWorking(true);
    setError('');
    setResult(null);
    try {
      const result = await ToolsService.signAddress({
        address: data.address,
        privateKey: data.privateKey,
        message: data.message,
        maxIndex: Number.parseInt(data.maxIndex)
      });
      setResult(result);
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    }
    setLocalIsWorking(false);
  };

  const updateBlockForSignatureMessage = async () => {
    const latestBlockHash = await BitcoinService.getLatestBlock(Network.TESTNET);
    setValue('message', latestBlockHash.hash);
  };

  return (
    <>
      <h1>Signature Generator</h1>
      <p>Use this utility to generate the signature for an address.</p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30, display: 'flex', flexDirection: 'column'}}>
          <FloatingLabel label="Exchange Private Key">
            <Form.Control
              style={{maxWidth: '1000px'}}
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
          </FloatingLabel>
        </div>

        <div style={{marginBottom: 30, display: 'flex', flexDirection: 'column'}}>
          <FloatingLabel label="Max Index">
            <Form.Control
              style={{maxWidth: '1000px'}}
              type="number"
              isInvalid={!!errors?.maxIndex}
              placeholder="Max Index"
              {...register('maxIndex')}/>

            <Form.Text className="text-muted">
              Max Index used to search for address within wallet.
            </Form.Text>
          </FloatingLabel>

          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="maxIndex"/>
          </Form.Text>

        </div>

        <div style={{marginBottom: 30}}>
          <FloatingLabel label="Address">
            <Form.Control
              style={{maxWidth: '1000px'}}
              isInvalid={!!errors?.address}
              placeholder="Address"
              {...register('address', {
                required: 'Address is required'
              })} />

            <Form.Text className="text-muted">
              Address containing exchange funds
            </Form.Text>
          </FloatingLabel>
          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="address"/>
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
          <FloatingLabel
            style={{marginBottom: 30}}
            label="Network">
            <Input type="text"
                   disabled={true}
                   value={network}/>
            <Form.Text className="text-muted">
              The network for this Submission.
            </Form.Text>
          </FloatingLabel>
          : null}

        {result ? <>
          <FloatingLabel
            style={{marginBottom: 30}}
            label="Derivation Path">
            <Input type="text"
                   disabled={true}
                   value={result.derivationPath}/>
            <Form.Text className="text-muted">
              Derivation path of address in wallet of index {result.index}, which is
              a {result.change ? 'change address' : 'receiving address'}
            </Form.Text>
          </FloatingLabel>

          <FloatingLabel
            style={{marginBottom: 30}}
            label="Signature">
            <Input type="text"
                   disabled={true}
                   value={result.signature}/>
          </FloatingLabel>

          <FloatingLabel
            style={{marginBottom: 30}}
            label="Balance">
            <Input type="text"
                   disabled={true}
                   value={formatSatoshi(result.balance)}/>
          </FloatingLabel>

          <FloatingLabel
            style={{marginBottom: 30}}
            label="Valid From">
            <Input type="text"
                   disabled={true}
                   value={formatDate(result.validFromDate)}/>
          </FloatingLabel>

        </> : null
        }

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

export default SignatureGenerator;
