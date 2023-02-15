import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import Input from '../input';
import ButtonPanel from '../button-panel';
import BigButton from '../big-button';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import Error from '../error';
import { UserService } from '../../open-api';
import { validateEmail } from '../../utils/is-valid-email';
import { ErrorMessage } from '@hookform/error-message';

interface FormData {
  email: string;
}

export const SignUp = () => {
  const { register, handleSubmit, formState: { isValid, errors } } = useForm<FormData>({
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [showCheckEmail, setShowCheckEmail] = useState<boolean>(false);

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      UserService.registerUser({ email: data.email });
      setShowCheckEmail(true);
    } catch (err) {
      let message = err.message;
      if (err instanceof AxiosError) {
        message = err.response?.data.message;
      }
      setError(message);
    }
    setIsWorking(false);
  };

  if (showCheckEmail) {
    return (
      <div>
        <p>Please check your email.</p>
      </div>
    );
  }

  return (
    <>
      <h3>Sign Up</h3>
      <Form onSubmit={handleSubmit(submit)}>
        <Input {...register('email', {
          required: 'Email is required',
          validate: validateEmail
        })}>
        </Input>
        <Form.Control.Feedback type="invalid">
          <ErrorMessage errors={errors} name="email"/>
        </Form.Control.Feedback>

        <Error>{error}</Error>
        <ButtonPanel>
          <BigButton
            disabled={isWorking || !isValid}
            type="submit">
            {isWorking ? 'Sign Up...' : 'Sign Up'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </>
  );

};