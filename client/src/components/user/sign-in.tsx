import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import ButtonPanel from '../button-panel';
import BigButton from '../big-button';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import Error from '../error';
import { UserService } from '../../open-api';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { ErrorMessage } from '@hookform/error-message';
import { validateEmail } from '../../utils/is-valid-email';
import { FloatingLabel } from 'react-bootstrap';

interface FormData {
  email: string;
  password: string;
}

export const SignIn = () => {
  const { signIn } = useStore();
  const { register, handleSubmit, formState: { isValid, errors } } = useForm<FormData>({
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const nav = useNavigate();

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      const credentials = await UserService.signIn({ email: data.email, password: data.password });
      signIn(credentials);
      nav('/');
    } catch (err) {
      let message = err.message;
      if (err instanceof AxiosError) {
        message = err.response?.data.message;
      }
      setError(message);
    }
    setIsWorking(false);
  };

  return (
    <>
      <h3>Sign In</h3>
      <Form onSubmit={handleSubmit(submit)}>

        <FloatingLabel label="Email">
          <Form.Control
            isInvalid={!!errors?.email}
            placeholder="Email"
            {...register('email', {
              required: 'Email is required',
              validate: validateEmail
            })}
          />
        </FloatingLabel>
        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="email"/>
        </Form.Text>

        <FloatingLabel label="Password">
          <Form.Control
            isInvalid={!!errors?.password}
            placeholder="Password"
            type="password"
                 {...register('password', {
                   required: 'Password is required'
                 })}>
          </Form.Control>
        </FloatingLabel>

        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="password"/>
        </Form.Text>

        <Error>{error}</Error>
        <ButtonPanel>
          <BigButton
            disabled={isWorking || !isValid}
            type="submit">
            {isWorking ? 'Set Password...' : 'Set Password'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </>
  );

};