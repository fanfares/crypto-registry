import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import Input from './input';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import { AxiosError } from 'axios';
import { useState } from 'react';
import ErrorMessage from './error-message';
import { UserService } from '../open-api';
import { isValidEmail } from '../utils/is-valid-email';

interface FormData {
  email: string;
}

export const RegisterUser = () => {
  const { register, handleSubmit, formState: { isValid } } = useForm<FormData>();
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [showCheckEmail, setShowCheckEmail] = useState<boolean>(false);

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      UserService.registerUser({ email: data.email });
      // await axios.post('/api/user/register', data);
      setShowCheckEmail(true);
    } catch (err) {
      let message = err.message;
      if (err instanceof AxiosError) {
        message = err.response?.data.message;
      }
      setError(message);
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
      <h3>Sign Up</h3>
      <Form onSubmit={handleSubmit(submit)}>
        <Input {
          ...register('email', {
          required: true,
          validate: isValidEmail })}>
        </Input>
          <ErrorMessage>{error}</ErrorMessage>
        <ButtonPanel>
          <BigButton
            disabled={isWorking || !isValid}
            type="submit">
            {isWorking ? 'Sign Up...' : 'Sign Up'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </>
  );

};
