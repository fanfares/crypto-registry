import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import ButtonPanel from '../button-panel';
import BigButton from '../big-button';
import React, { useState } from 'react';
import Error from '../error';
import { ApiError, UserService } from '../../open-api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';

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
      console.log(err);
      let message = err.message;
      if (err instanceof ApiError) {
        message = err.body.message;
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
      <Form style={{ marginTop: 10 }} onSubmit={handleSubmit(submit)}>

        <div style={{ marginBottom: 20 }}>
          <FloatingLabel
            label="Password">
            <Form.Control placeholder="Password"
                          type="password"
                          isInvalid={!!errors?.password}
                          {...register('password', {
                            required: 'Password is required'
                          })}>
            </Form.Control>
          </FloatingLabel>
          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="password"/>
          </Form.Text>
        </div>

        <div style={{ marginBottom: 20 }}>
          <FloatingLabel label="Confirm Password">
            <Form.Control
              type="password"
              isInvalid={!!errors?.confirmPassword}
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
            </Form.Control>
          </FloatingLabel>
          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="confirmPassword"/>
          </Form.Text>
        </div>

        <Error>{error}</Error>
        <ButtonPanel>
          <BigButton
            disabled={isWorking || !isValid}
            type="submit">
            Set Password
          </BigButton>
        </ButtonPanel>
      </Form>
    </>
  );

};
