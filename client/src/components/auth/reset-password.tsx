import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import ButtonPanel from '../utils/button-panel.ts';
import BigButton from '../utils/big-button.tsx';
import { useState } from 'react';
import Error from '../utils/error.ts';
import { AuthService } from '../../open-api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import { getErrorMessage } from '../../utils';

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
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const token = searchParams.get('token');
  const nav = useNavigate();

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

  if (!token) {
    return (
      <div>
        <p>This page expects a token query parameter.</p>
      </div>
    );
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
          <ButtonPanel>
            <BigButton
              disabled={!isValid}
              loading={isWorking}
              htmlType="submit">
              Set Password
            </BigButton>
          </ButtonPanel>
        </Form>
      </div>
    </div>
  );

};
