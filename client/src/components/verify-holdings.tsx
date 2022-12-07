import Form from 'react-bootstrap/Form';
import React, { useState, useEffect } from 'react';
import { CustomerService, VerificationResult, ApiError } from '../open-api';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import Input from './input';
import { useStore } from '../store';
import { useForm, SubmitHandler } from 'react-hook-form';
import { isValidEmail } from '../utils/is-valid-email';

export interface FormInputs {
  email: string;
}

function VerifyHoldings() {

  const { customerEmail, setCustomerEmail, clearErrorMessage } = useStore();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const { register, handleSubmit, formState: { isValid } } = useForm<FormInputs>({
    mode: 'onBlur',
    defaultValues: {
      email: customerEmail
    }
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [ isWorking, setIsWorking ] = useState<boolean>(false);

  useEffect(() => {
    clearErrorMessage()
  }, [] )

  const onSubmit: SubmitHandler<FormInputs> = async data => {
    console.log(data);
    setIsWorking(true);
    setErrorMessage('')
    setCustomerEmail(data.email);
    try {
      const result = await CustomerService.verifyHoldings({
        email: data.email
      })
      setVerificationResult(result.verificationResult);
    } catch ( err) {
      let errorMessage = err.message;
      if ( err instanceof ApiError) {
        errorMessage = err.body.message;
      }
      setErrorMessage(errorMessage)
    }
    setIsWorking(false);
  };

  let verificationResultDisplay;
  if (verificationResult) {
    verificationResultDisplay = <p>Result: {verificationResult}</p>;
  } else if (errorMessage) {
    verificationResultDisplay = <p>Failed: {errorMessage}</p>;
  } else {
    verificationResultDisplay = '';
  }

  return (
    <div>
      <h1>Verify your Crypto</h1>
      <p>Privately verify your crypto holdings. We will send you an
        email if we can positively verify your crypto with a custodian</p>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input {...register('email', {
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
      <div>{verificationResultDisplay}</div>
    </div>
  );
}

export default VerifyHoldings;
