import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import ButtonPanel from '../utils/button-panel.ts';
import BigButton from '../utils/big-button.tsx';
import { useState } from 'react';
import Error from '../utils/error.ts';
import { AuthService } from '../../open-api';
import { validateEmail } from '../../utils/is-valid-email.ts';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import { getErrorMessage } from '../../utils';

interface FormData {
  email: string;
}

export const SignUp = () => {
  const {register, handleSubmit, formState: {isValid, errors}} = useForm<FormData>({
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [showCheckEmail, setShowCheckEmail] = useState<boolean>(false);

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      AuthService.registerUser({email: data.email});
      setShowCheckEmail(true);
    } catch (err) {
      setError(getErrorMessage(err));
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
      <Form style={{marginTop: 30}}
            onSubmit={handleSubmit(submit)}>

        <div style={{marginBottom: 20}}>
          <FloatingLabel
            label="Email">
            <Form.Control
              isInvalid={!!errors?.email}
              placeholder="Email"
              {...register('email', {
                required: 'Email is required',
                validate: validateEmail
              })}>
            </Form.Control>
          </FloatingLabel>
          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="email"/>
          </Form.Text>
        </div>

        <Error>{error}</Error>
        <ButtonPanel>
          <BigButton
            disabled={!isValid}
            loading={isWorking}
            htmlType="submit">
            {isWorking ? 'Sign Up...' : 'Sign Up'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </>
  );

};
