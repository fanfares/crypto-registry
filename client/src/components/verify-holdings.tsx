import Form from 'react-bootstrap/Form';
import React, { useState, useEffect } from 'react';
import { CustomerService, ApiError } from '../open-api';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import Input from './input';
import { useStore } from '../store';
import { useForm, SubmitHandler } from 'react-hook-form';
import { isValidEmail } from '../utils/is-valid-email';
import ErrorMessage from './error-message';

export interface FormInputs {
  email: string;
}

function VerifyHoldings() {

  const { customerEmail, setCustomerEmail, clearErrorMessage, network } = useStore();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const { register, handleSubmit, formState: { isValid } } = useForm<FormInputs>({
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
      await CustomerService.verifyHoldings({ email: data.email, network: network });
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
      <p>We have sent an email to {customerEmail} with your verified holdings</p>
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
        <Input
          {...register('email', {
            required: true,
            validate: isValidEmail
          })}
          type="text"
          placeholder="Your Email" />
        <ButtonPanel>
          <BigButton variant="primary"
                     disabled={!isValid || isWorking}
                     type="submit">
            Verify
          </BigButton>
        </ButtonPanel>
      </Form>
      <ButtonPanel>
        {errorMessage ? <ErrorMessage>{errorMessage}</ErrorMessage> : null}
      </ButtonPanel>
    </div>
  );
}

export default VerifyHoldings;
