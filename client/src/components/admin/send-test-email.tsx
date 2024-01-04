import { useForm } from 'react-hook-form';
import Form from 'react-bootstrap/Form';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import React, { useState } from 'react';
import Error from '../utils/error';
import { TestService } from '../../open-api';
import { validateEmail } from '../../utils/is-valid-email';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
// import { getApiErrorMessage } from '../../utils/get-api-error-message';
import { CentreLayoutContainer } from '../utils/centre-layout-container';

interface FormData {
  email: string;
}

export const SendTestEmail = () => {
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
      await TestService.sendTestVerificationEmail({email: data.email});
      setShowCheckEmail(true);
    } catch (err) {
      setError(err.messasge);
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
    <CentreLayoutContainer>
      <h1>Send Test Email</h1>
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

        <Error>{error}</Error>
        <ButtonPanel>
          <BigButton
            disabled={isWorking || !isValid}
            type="submit">
            {isWorking ? 'Sending...' : 'Send'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </CentreLayoutContainer>
  );

};
