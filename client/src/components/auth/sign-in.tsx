import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import BigButton from '../utils/big-button.tsx';
import { useState } from 'react';
import Error from '../utils/error.ts';
import { AuthService } from '../../open-api';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { ErrorMessage } from '@hookform/error-message';
import { validateEmail } from '../../utils/is-valid-email.ts';
import { FloatingLabel } from 'react-bootstrap';
import { getErrorMessage } from '../../utils';

interface FormData {
  email: string;
  password: string;
}

export const SignIn = () => {
  const {signIn} = useStore();
  const {register, handleSubmit, formState: {isValid, errors}} = useForm<FormData>({
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const nav = useNavigate();

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      const credentials = await AuthService.signIn({
        email: data.email,
        password: data.password
      });
      signIn(credentials);
      nav('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  return (
    <>
      <h4>Exchange Sign-In</h4>
      <Form style={{marginTop: 30}}
            onSubmit={handleSubmit(submit)}>

        <div style={{marginBottom: 20}}>
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
        </div>

        <div style={{marginBottom: 20}}>
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
        </div>

        <Error>{error}</Error>

        <div style={{margin: '20px'}}>
          <BigButton
            disabled={!isValid}
            loading={isWorking}
            htmlType="submit">
            {isWorking ? 'Sign In...' : 'Sign In'}
          </BigButton>
        </div>
      </Form>

      <Link to="/forgot-password">Forgot Password</Link>
    </>
  );

};
