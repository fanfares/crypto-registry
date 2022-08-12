import Button from 'react-bootstrap/Button';
import React from 'react';
import { CustomerHoldingService } from './open-api';

export interface SendAnEmailProps {
  email: string;
}

export const SendAnEmail = (props: SendAnEmailProps) => {

  const sendEmail = async () => {
    await CustomerHoldingService.sendTestEmail({email: props.email});
  };

  return (
    <div>
      <p>Send an email to {props.email}</p>
      <Button variant="primary"
              onClick={sendEmail}
              type="button">
        Send
      </Button>
    </div>
  );
};
