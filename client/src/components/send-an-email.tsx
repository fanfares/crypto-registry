import Button from 'react-bootstrap/Button';
import React, { useState } from 'react';
import { TestService } from '../open-api';

export interface SendAnEmailProps {
  email: string;
}

export const SendAnEmail = (props: SendAnEmailProps) => {
  const [errorMessage, setErrorMessage] = useState<string>('');

  const sendEmail = async () => {
    try {
      setErrorMessage('');
      await TestService.sendTestEmail({email: props.email});
    } catch (err: any) {
      setErrorMessage(err.body.message);
    }
  };

  let error;
  if (errorMessage !== '') {
    error = <p>{errorMessage}</p>;
  }

  return (
    <div>
      <p>Send an email to {props.email}</p>
      {error}
      <Button variant="primary"
              onClick={sendEmail}
              type="button">
        Send
      </Button>
    </div>
  );
};
