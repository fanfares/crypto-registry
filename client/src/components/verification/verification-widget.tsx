import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react';
import { VerificationService } from '../../open-api';
import BigButton from '../utils/big-button.tsx';
import ButtonPanel from '../utils/button-panel';
import { useStore } from '../../store';
import { SubmitHandler, useForm } from 'react-hook-form';
import LegacyErrorMessage from '../utils/errorMessage.ts';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import Input from '../utils/input';
import { getErrorMessage, validateUidOrEmail } from '../../utils';

export interface FormInputs {
  email: string;
}

function VerificationWidget() {

  const {customerEmail, setCustomerEmail, clearErrorMessage} = useStore();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationNode, setVerificationNode] = useState<string>();
  const {register, handleSubmit, formState: {isValid, errors}} = useForm<FormInputs>({
    mode: 'onChange',
    defaultValues: {
      email: customerEmail
    }
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);

  useEffect(() => {
    clearErrorMessage();
  }, []); // eslint-disable-line

  const onSubmit: SubmitHandler<FormInputs> = async data => {
    setIsWorking(true);
    setErrorMessage('');
    setCustomerEmail(data.email);
    try {
      const res = await VerificationService.createVerification({email: data.email});
      setVerificationNode(res.leaderAddress);
      setIsVerified(true);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  if (isVerified) {
    return (<>
      <h1>Verify Customer Balances</h1>
      <p>Your holdings have been verified. Node {verificationNode} will send an email to {customerEmail} with your
        verified balances</p>
      <ButtonPanel>
        <BigButton onClick={() => setIsVerified(false)}>Verify Again</BigButton>
      </ButtonPanel>
      <br/>
    </>);
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>

        <FloatingLabel label="Your email">
          <Input
            isInvalid={!!errors?.email}
            {...register('email', {
              required: true,
              validate: validateUidOrEmail
            })}
            type="text"
            placeholder="Your Email"/>
        </FloatingLabel>

        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="email"/>
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
        {errorMessage ? <LegacyErrorMessage>{errorMessage}</LegacyErrorMessage> : null}
      </ButtonPanel>
    </>
  );
}

export default VerificationWidget;
