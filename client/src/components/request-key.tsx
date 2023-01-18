import Form from 'react-bootstrap/Form';
import Input from './input';
import { SubmitHandler, useForm } from 'react-hook-form';
import React, { useState } from 'react';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import { isValidEmail } from '../utils/is-valid-email';
import { AxiosError } from 'axios';
import { ApiError } from '../open-api';

export interface RequestForm {
  email: string;
  exchangeName: string;
}

const RequestKey = () => {

  const {
    register,
    handleSubmit,
    formState: { isValid }
  } = useForm<RequestForm>({
    mode: 'onChange'
  });

  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState('');
  const [requested, setIsRequested] = useState(false);

  const onSubmit: SubmitHandler<RequestForm> = async data => {
    setIsWorking(true);
    setError('')
    try {

    } catch (err) {
      let msg = err.message;
      if (err instanceof ApiError) {
        msg = err.body.message
      }
      setError(msg)
    }
  };

  return (
    <div>
      <h1>Request Network API Key</h1>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('email', {
            required: true,
            validate: isValidEmail
          })}
          type="text"
          placeholder="Your Email"/>

        <Input
          {...register('exchangeName', {
            required: true
          })}
          placeholder="Exchange Name"/>

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

export default RequestKey;
