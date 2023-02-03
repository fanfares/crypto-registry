import Form from 'react-bootstrap/Form';
import Input from './input';
import { SubmitHandler, useForm } from 'react-hook-form';
import React, { useState } from 'react';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import { isValidEmail } from '../utils/is-valid-email';
import { ApiError, RegistrationService } from '../open-api';
import ErrorMessage from './error-message';

export interface JoinNetworkForm {
  email: string;
  institutionName: string;
  toNodeAddress: string;
}

const JoinNetwork = () => {

  const {
    register,
    handleSubmit,
    formState: { isValid }
  } = useForm<JoinNetworkForm>({
    mode: 'onChange'
  });

  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState('');
  const [requested, setIsRequested] = useState(false);

  const onSubmit: SubmitHandler<JoinNetworkForm> = async data => {
    setIsWorking(true);
    setError('');
    try {
      await RegistrationService.sendRegistration({
        email: data.email,
        institutionName: data.institutionName,
        toNodeAddress: data.toNodeAddress
      });
      setIsRequested(true);
    } catch (err) {
      let msg = err.message;
      if (err instanceof ApiError) {
        msg = err.body.message;
      }
      setError(msg);
    }
    setIsWorking(false);
  };

  if (requested) {
    return (
      <>
        <h1>Join Network</h1>
        <p>
          Your request has been submitted. The Network will send you an email shortly to initiate the approval process.
        </p>
      </>
    );
  }

  return (
    <div>
      <h1>Join Network Request</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('email', {
            required: true,
            validate: isValidEmail
          })}
          type="text"
          placeholder="Your Email" />

        <Input
          {...register('institutionName', {
            required: true
          })}
          placeholder="Exchange Name" />

        <Input
          {...register('toNodeAddress', {
            required: true
          })}
          placeholder="Connection Address" />

        <ErrorMessage>{error}</ErrorMessage>
        <ButtonPanel>
          <BigButton variant="primary"
                     disabled={!isValid || isWorking}
                     type="submit">
            {isWorking ? 'Verifying...' : 'Verify'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </div>
  );

};

export default JoinNetwork;
