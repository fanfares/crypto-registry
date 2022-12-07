import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import CurrentSubmission from './current-submission';
import { useStore } from '../store';
import ErrorMessage from './error-message';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import Input from './input';

export const CheckSubmission = () => {
  const { loadSubmission, submissionStatus } = useStore();
  const [paymentAddress, setPaymentAddress] = useState<string>('');

  const handleChange = (e: any) => {
    e.preventDefault();
    setPaymentAddress(e.currentTarget.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadSubmission(paymentAddress);
  };

  if (submissionStatus) {
    return <CurrentSubmission />;
  }

  return (
    <div>
      <h1>Submission Check</h1>
      <p>To check the status of your submissions, please enter the payment address.</p>
      <Form onSubmit={handleSubmit}>
        <Input
          required
          onChange={handleChange}
          type="text"
          placeholder="Enter the payment address"
          id="paymentAddress" />
        <ButtonPanel>
          <BigButton type="submit">Check</BigButton>
        </ButtonPanel>
      </Form>
      <ErrorMessage />
    </div>
  );
};
