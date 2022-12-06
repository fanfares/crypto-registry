import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { ExchangeService, SubmissionStatusDto, SubmissionStatus } from './open-api';
import Button from 'react-bootstrap/Button';

export const CheckSubmissionsForm = () => {
  const [paymentAddress, setPaymentAddress] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatusDto | null>(null);

  const handleChange = (e: any) => {
    e.preventDefault();
    setSubmissionStatus(null)
    setPaymentAddress(e.currentTarget.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    ExchangeService.getSubmissionStatus(paymentAddress)
      .then(result => {
        console.log('Submission Status', result);
        setSubmissionStatus(result);
      })
      .catch(err => {
        setErrorMessage(err.message);
      });
  };

  const renderStatus = () => {
    if ( !submissionStatus ) {
      return (<div>Submission is not started</div>)
    }
    switch (submissionStatus.submissionStatus ) {
      case SubmissionStatus.UNUSED:
        return (<div>Unused</div>)
      case SubmissionStatus.WAITING_FOR_PAYMENT:
        return (<div>Waiting for Payment</div>)
      case SubmissionStatus.COMPLETE:
        return (<div>Submissions Complete</div>)
    }
  }

  return (
    <div>
      <p>To check the status of your submissions, please check below.</p>
      {errorMessage ? <p>{errorMessage}</p> : ''}
      <Form onSubmit={handleSubmit}>
        <Form.Control
          onChange={handleChange}
          type="text"
          placeholder="Enter Custodian Public Key"
          id="custodianPublicKey" />
        <Button type='submit'>Check</Button>
      </Form>
      {renderStatus()}
    </div>
  );
};
