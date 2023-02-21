import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import ButtonPanel from '../button-panel';
import BigButton from '../big-button';
import React, { useState } from 'react';
import Error from '../error';
import { UserService, ApiError } from '../../open-api';
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
      const credentials = await UserService.signIn({
        email: data.email,
        password: data.password
      });
      signIn(credentials);
      nav('/submit-file');
    } catch (err) {
      let message = err.message;
      if (err instanceof ApiError) {
        message = err.body?.message || err.statusText;
      }
      setError(message);
    }
    setIsWorking(false);
  };

  return (
    <>
      <Form style={{ marginTop: 30 }}
            onSubmit={handleSubmit(submit)}>

        <div style={{ marginBottom: 20 }}>
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
            <ErrorMessage errors={errors} name="email" />
          </Form.Text>
        </div>

        <div style={{ marginBottom: 20 }}>
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
            <ErrorMessage errors={errors} name="password" />
          </Form.Text>
        </div>

        <Error>{error}</Error>
        <ButtonPanel>
          <BigButton
            disabled={isWorking || !isValid}
            type="submit">
            {isWorking ? 'Sign In...' : 'Sign In'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </>
  );

};
