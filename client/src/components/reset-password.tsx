import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import Input from './input';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import { AxiosError } from 'axios';
import { useState } from 'react';
import ErrorMessage from './error-message';
import { UserService } from '../open-api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';

interface FormData {
  password: string;
  confirmPassword: string;
}

export const ResetPassword = () => {
  const { signIn } = useStore()
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, formState: { isValid } } = useForm<FormData>();
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const token = searchParams.get('token');
  const nav = useNavigate()

  const gotoHome = () => {
    nav('/')
  }

  const submit = async (data: FormData) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsWorking(true);
    try {
      const credentials = await UserService.resetPassword({ token: token ?? '', password: data.password });
      signIn(credentials)
      setResetSuccess(true);
    } catch (err) {
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
        <Input type='password'
               {...register('password', { required: true })}>
        </Input>
        <Input type='password'
               {...register('confirmPassword', { required: true })}>
        </Input>
          <ErrorMessage>{error}</ErrorMessage>
        <ButtonPanel>
          <BigButton
            disabled={isWorking || !isValid }
            type="submit">
            {isWorking ? 'Set Password...' : 'Set Password'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </>
  );

};
