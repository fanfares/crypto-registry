import Form from 'react-bootstrap/Form';
import React, { useEffect, useState } from 'react';
import { ApiError, VerificationService } from '../open-api';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import { useStore } from '../store';
import { SubmitHandler, useForm } from 'react-hook-form';
import { validateEmail } from '../utils/is-valid-email';
import Error from './error';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';

export interface FormInputs {
  email: string;
}

function VerificationPage() {

  const { customerEmail, setCustomerEmail, clearErrorMessage } = useStore();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationNode, setVerificationNode] = useState<string>();
  const { register, handleSubmit, formState: { isValid, errors } } = useForm<FormInputs>({
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
      const res = await VerificationService.verify({ email: data.email });
      setVerificationNode(res.selectedEmailNode);
      setIsVerified(true);
    } catch (err) {
      let errorMessage = err.message;
      if (err instanceof ApiError) {
        errorMessage = err.body.message;
      }
      setErrorMessage(errorMessage);
    }
    setIsWorking(false);
  };

  if (isVerified) {
    return (<div>
      <h1>Verify your Crypto</h1>
      <p>Your holdings have been verified. Node {verificationNode} will send an email to {customerEmail} with your
        verified holdings</p>
      <ButtonPanel>
        <BigButton onClick={() => setIsVerified(false)}>Verify Again</BigButton>
      </ButtonPanel>
    </div>);
  }

  return (
    <div>
      <h1>Verify Crypto Holdings</h1>
      <p>Privately verify your crypto holdings. We will send you an
        email if we can positively verify your crypto with a custodian</p>
      <Form onSubmit={handleSubmit(onSubmit)}>

        <FloatingLabel label="Your email">
          <Form.Control
            isInvalid={!!errors?.email}
            {...register('email', {
              required: true,
              validate: validateEmail
            })}
            type="text"
            placeholder="Your Email" />
        </FloatingLabel>

        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="email" />
        </Form.Text>

        <ButtonPanel>
          <BigButton variant="primary"
                     disabled={!isValid || isWorking}
                     type="submit">
            {isWorking ? 'Verifying...' : 'Verify'}
          </BigButton>
        </ButtonPanel>
      </Form>
      <ButtonPanel>
        {errorMessage ? <Error>{errorMessage}</Error> : null}
      </ButtonPanel>
    </div>
  );
}

export default VerificationPage;
