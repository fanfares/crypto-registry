import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import React, { useState } from 'react';
import Error from '../utils/error';
import { TestService } from '../../open-api';
import { validateEmail } from '../../utils/is-valid-email';
import { ErrorMessage } from '@hookform/error-message';
import { Button, FloatingLabel } from 'react-bootstrap';

interface FormData {
  email: string;
}

const EmailTester = () => {
  const {register, handleSubmit, formState: {isValid, errors}} = useForm<FormData>({
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const submit = async (data: FormData) => {
    setError('');
    setIsWorking(true);
    try {
      await TestService.sendTestVerificationEmail({email: data.email});
      setIsChecked(true);
    } catch (err) {
      setError(err.message);
    }
    setIsWorking(false);
  };

  const sendAnother = () => {
    setIsChecked(false);
  };

  return (
    <>
      <h1>Email Tester</h1>
      <p>Use this utility to ensure emails are being sent.</p>
      <Form onSubmit={handleSubmit(submit)}>

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

        {isChecked ? <p>Test Email Sent. Please check your email.</p> : null}

        <Error>{error}</Error>
        <ButtonPanel>
          {!isChecked ?
            <BigButton
              disabled={isWorking || !isValid}
              type="submit">
              {isWorking ? 'Sending...' : 'Send'}
            </BigButton> :
            null
          }
          {isChecked ?
            <Button type="button"
                    onClick={sendAnother}>
              Send Another
            </Button> : null
          }
        </ButtonPanel>
      </Form>
    </>
  );

};

export default EmailTester;
