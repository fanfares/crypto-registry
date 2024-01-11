import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import { useState } from 'react';
import Error from '../utils/error';
import { UserService } from '../../open-api';
import { ErrorMessage } from '@hookform/error-message';
import { validateEmail } from '../../utils/is-valid-email';
import { FloatingLabel } from 'react-bootstrap';
// import { Properties } from 'csstype';
import { useNavigate } from 'react-router-dom';
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
  email: string;
}

export const ForgotPassword = () => {
  const {register, handleSubmit, formState: {isValid, errors}} = useForm<FormData>({
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [sent, setIsSent] = useState<boolean>(false);
  const nav = useNavigate();

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      await UserService.sendResetPasswordEmail({
        email: data.email
      });
      setIsSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  if (sent) {
    return (
      <div style={centreContainer}>
        <div style={resetDialog}>
          <div style={{marginTop: 30}}>
            <h4>Email Sent</h4>
            <p>
              If the email address you entered is valid, you will receive an email with a link to reset your password.
            </p>
          </div>
          <ButtonPanel>
            <BigButton
              onClick={() => nav('/sign-in')}
              type="submit">
              Back
            </BigButton>
          </ButtonPanel>
        </div>
      </div>
    );
  }

  return (
    <div style={centreContainer}>
      <div style={resetDialog}>
        <h4>Forgot Password</h4>
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

          <Error>{error}</Error>
          <ButtonPanel>
            <BigButton
              disabled={isWorking || !isValid}
              type="submit">
              {isWorking ? 'Sending...' : 'Send'}
            </BigButton>
          </ButtonPanel>
        </Form>
      </div>
    </div>
  );

};
