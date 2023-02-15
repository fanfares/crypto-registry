import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import Input from '../input';
import ButtonPanel from '../button-panel';
import BigButton from '../big-button';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import Error from '../error';
import { UserService } from '../../open-api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { ErrorMessage } from '@hookform/error-message';

interface FormData {
  password: string;
  confirmPassword: string;
}

export const ResetPassword = () => {
  const { signIn } = useStore();
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, formState: { isValid, errors }, watch } = useForm<FormData>({
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const token = searchParams.get('token');
  const nav = useNavigate();

  const gotoHome = () => {
    nav('/');
  };

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      const credentials = await UserService.resetPassword({ token: token ?? '', password: data.password });
      signIn(credentials);
      setResetSuccess(true);
    } catch (err) {
      console.log(err)
      let message = err.message;
      if (err instanceof AxiosError) {
        message = err.response?.data.message;
      }
      setError(message);
    }
    setIsWorking(false);
  };

  if (!token) {
    return (
      <div>
        <p>This page expects a token query parameter.</p>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div>
        <p>You are logged in.</p>
        <ButtonPanel>
          <BigButton onClick={gotoHome}>Home</BigButton>
        </ButtonPanel>
      </div>
    );
  }

  return (
    <>
      <h3>Set Password</h3>
      <Form onSubmit={handleSubmit(submit)}>
        <Input type="password"
               isInvalid={errors.password}
               {...register('password', {
                 required: 'Password is required'
               })}>
        </Input>
        <Form.Control.Feedback type="invalid">
          <ErrorMessage errors={errors} name="password"/>
        </Form.Control.Feedback>

        <Input type="password"
               isInvalid={errors.confirmPassword}
               {...register('confirmPassword', {
                 required: 'Password confirmation is required',
                 validate: (val: string) => {
                   if (watch('password') !== val) {
                     return 'Passwords do not match';
                   } else {
                     return true;
                   }
                 }
               })}>
        </Input>
        <Form.Control.Feedback type="invalid">
          <ErrorMessage errors={errors} name="confirmPassword"/>
        </Form.Control.Feedback>

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
