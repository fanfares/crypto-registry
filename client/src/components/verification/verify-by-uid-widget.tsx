import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import { VerificationResultDto, VerificationService } from '../../open-api';
import BigButton from '../utils/big-button.tsx';
import ButtonPanel from '../utils/button-panel';
import { SubmitHandler, useForm } from 'react-hook-form';
import Error from '../utils/error';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import Input from '../utils/input';
import { getErrorMessage, validateUid } from '../../utils';
import VerifiedHoldingsTable from '../verified-holdings-table.tsx';

export interface FormInputs {
  uid: string;
}

function VerifyByUidWidget() {

  const [verificationResult, setVerificationResult] = useState<VerificationResultDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const {register, handleSubmit, formState: {isValid, errors}} = useForm<FormInputs>({
    mode: 'onChange'
  });

  const onSubmit: SubmitHandler<FormInputs> = async data => {
    setIsWorking(true);
    setErrorMessage('');
    try {
      setVerificationResult(await VerificationService.verifyByUid({uid: data.uid}));
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  if (verificationResult) {
    return (<>
      <p>Your holdings have been verified. verified balances</p>
      <VerifiedHoldingsTable holdings={verificationResult.verifiedHoldings}/>
      <ButtonPanel>
        <BigButton onClick={() => setVerificationResult(null)}>Verify Again</BigButton>
      </ButtonPanel>
      <br/>
    </>);
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>

        <FloatingLabel label="Your Exchange UUID">
          <Input
            isInvalid={!!errors?.uid}
            {...register('uid', {
              required: true,
              validate: validateUid
            })}
            type="text"
            placeholder="Exchange UUID"/>
        </FloatingLabel>

        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="uid"/>
        </Form.Text>

        <div style={{margin: '20px'}}>
          <BigButton disabled={!isValid}
                     loading={isWorking}
                     htmlType="submit">
            {isWorking ? 'Verifying...' : 'Verify'}
          </BigButton>
        </div>
      </Form>
      <ButtonPanel>
        {errorMessage ? <Error>{errorMessage}</Error> : null}
      </ButtonPanel>
    </>
  );
}

export default VerifyByUidWidget;
