import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import Input from '../utils/input';
import { FloatingLabel } from 'react-bootstrap';
import MyErrorMessage from '../utils/error-message';
import { ErrorMessage } from '@hookform/error-message';
import { BalanceCheckerResponseDto, BitcoinService } from '../../open-api';
import { getErrorMessage } from '../../utils';
import { formatSatoshi } from '../utils/satoshi.tsx';

interface Inputs {
  address: string;
}

const BalanceChecker = () => {

  const [localIsWorking, setLocalIsWorking] = useState(false);

  const {
    handleSubmit,
    register,
    formState: {isValid, errors}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<BalanceCheckerResponseDto | null>(null);

  const handleSubmission = async (data: Inputs) => {
    setLocalIsWorking(true);
    setError('');
    setResult(null);
    try {
      const result = await BitcoinService.balanceCheck({
        address: data.address
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
      <h1>Balance Checker</h1>
      <p>Use this utility to check the system is generating the correct balance for an address.</p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30}}>
          <FloatingLabel label="Address">
            <Form.Control
              style={{maxWidth: '600px'}}
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

        {result ? <>

          <FloatingLabel
            style={{marginBottom: 30}}
            label="Network">
            <Input type="text"
                   disabled={true}
                   value={result.network}/>
            <Form.Text className="text-muted">
              The network for this Submission.
            </Form.Text>
          </FloatingLabel>

          <FloatingLabel
            style={{marginBottom: 30}}
            label="Electrum-X Balance">
            <Input type="text"
                   disabled={true}
                   value={formatSatoshi(result.electrumBalance)}/>
          </FloatingLabel>

          <FloatingLabel
            style={{marginBottom: 30}}
            label="BlockStream Balance">
            <Input type="text"
                   disabled={true}
                   value={formatSatoshi(result.blockStreamBalance)}/>
          </FloatingLabel>
        </> : null
        }

        <div>
          <MyErrorMessage errorMessage={error}/>
          <ButtonPanel>
            <BigButton disabled={!isValid || localIsWorking}
                       htmlType="submit">
              {localIsWorking ? 'Generating...' : 'Generate'}
            </BigButton>
          </ButtonPanel>
        </div>
      </Form>
    </>
  );
};

export default BalanceChecker;
