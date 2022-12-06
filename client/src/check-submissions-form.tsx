import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import CurrentSubmission from './components/current-submission';
import { useStore } from './store';

export const CheckSubmissionsForm = () => {
  const { loadSubmission } = useStore();
  const [paymentAddress, setPaymentAddress] = useState<string>('');

  const handleChange = (e: any) => {
    e.preventDefault();
    setPaymentAddress(e.currentTarget.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadSubmission(paymentAddress);
  };

  return (
    <div>
      <p>To check the status of your submissions, please enter the payment address.</p>
      <Form onSubmit={handleSubmit}>
        <Form.Control
          onChange={handleChange}
          type="text"
          placeholder="Enter the payment address"
          id="paymentAddress" />
        <Button type="submit">Load</Button>
      </Form>
      <CurrentSubmission />
    </div>
  );
};
