import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { ExchangeService, SubmissionStatusDto } from './open-api';
import Button from 'react-bootstrap/Button';
import SubmissionStatus from './components/current-submission';
import Submission from './components/current-submission';
import CurrentSubmission from './components/current-submission';

export const CheckSubmissionsForm = () => {
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatusDto | null>(null);

  const handleChange = (e: any) => {
    e.preventDefault();
    setSubmissionStatus(null);
    setPaymentAddress(e.currentTarget.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null)
    setSubmissionStatus(null);
    try {
      const data = await ExchangeService.getSubmissionStatus(paymentAddress);
      setSubmissionStatus(data);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div>
      <p>To check the status of your submissions, please check below.</p>
      {errorMessage ? <p>{errorMessage}</p> : ''}
      <Form onSubmit={handleSubmit}>
        <Form.Control
          onChange={handleChange}
          type="text"
          placeholder="Enter the Payment Address"
          id="paymentAddress" />
        <Button type="submit">Check</Button>
      </Form>
      <CurrentSubmission />
    </div>
  );
};
