import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import BigButton from '../utils/big-button.tsx';
import { useEffect, useState } from 'react';
import Error from '../utils/error.ts';
import { AuthService } from '../../open-api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import { getErrorMessage } from '../../utils';
import { Spin } from 'antd';

const centreContainer = {
  display: 'flex',
  justifyContent: 'center', /* Center horizontally */
  alignItems: 'center',    /* Center vertically */
  height: '50vh'           /* 100% of the viewport height */
};

const resetDialog = {
  width: '500px',
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
};

interface FormData {
  password: string;
  confirmPassword: string;
}

export const ResetPassword = () => {
  const {signIn} = useStore();
  const [searchParams] = useSearchParams();
  const {register, handleSubmit, formState: {isValid, errors}, watch} = useForm<FormData>({
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(true);
  const [expiredToken, setIsExpiredToken] = useState<boolean>(false);
  const token = searchParams.get('token');
  const nav = useNavigate();

  useEffect(() => {
    setIsWorking(true);
    if (token) {
      AuthService.verifyPasswordResetToken({token}).then(result => {
        setIsExpiredToken(result.expired);
        setIsWorking(false);
      }).catch(err => {
        setError(getErrorMessage(err));
      });
    }
  }, []);

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      const credentials = await AuthService.resetPassword({token: token ?? '', password: data.password});
      signIn(credentials);
      nav('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  const sendTokeAgain = () => {

  };

  if (expiredToken) {
    return (
      <>
        <h1>Token Expired</h1>
        <div style={{margin: '20px'}}>
          <BigButton onClick={sendTokeAgain}>
            Send Again
          </BigButton>
        </div>
      </>
    );
  }

  if (!token) {
    return (
      <div>
        <p>This page expects a token query parameter.</p>
      </div>
    );
  }

  if (isWorking) {
    return <div>
      <Spin size="large"/>
    </div>;
  }

  return (
    <div style={centreContainer}>
      <div style={resetDialog}>
        <h4>Set your password</h4>
        <Form style={{marginTop: 10}} onSubmit={handleSubmit(submit)}>

          <div style={{marginBottom: 20}}>
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

          <div style={{marginBottom: 20}}>
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
          <div style={{margin: '20px'}}>
            <BigButton
              disabled={!isValid}
              loading={isWorking}
              htmlType="submit">
              Set Password
            </BigButton>
          </div>
        </Form>
      </div>
    </div>
  );

};
