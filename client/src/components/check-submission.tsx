import React, { useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import { useStore } from '../store';
import GlobalErrorMessage from './global-error-message';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import Input from './input';
import { useNavigate } from 'react-router-dom';

export const CheckSubmission = () => {
  const { loadSubmission, clearErrorMessage, isWorking } = useStore();
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const nav = useNavigate();

  useEffect(() => {
    clearErrorMessage();
  }, []); // eslint-disable-line

  const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPaymentAddress(e.currentTarget.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSubmissionStatus = await loadSubmission(paymentAddress);
    if (newSubmissionStatus) {
      nav('/submit-file');
    }
  };

  return (
    <div>
      <h1>Check Submission</h1>
      <p>To check the status of your submissions, please enter the payment address.</p>
      <Form onSubmit={handleSubmit}>
        <Input
          required
          onChange={handleChange}
          type="text"
          placeholder="Enter the payment address"
          id="paymentAddress" />
        <ButtonPanel>
          <BigButton
            disabled={isWorking}
            type="submit">{isWorking ? 'Checking...' : 'Check'}</BigButton>
        </ButtonPanel>
      </Form>
      <GlobalErrorMessage />
    </div>
  );
};
