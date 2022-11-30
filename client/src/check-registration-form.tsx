import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { ExchangeService, RegistrationCheckResult } from './open-api';
import Button from 'react-bootstrap/Button';

export const CheckRegistrationForm = () => {
  const [custodianPK, setCustodianPK] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<RegistrationCheckResult | null>(null);

  const handleChange = (e: any) => {
    e.preventDefault();
    setRegistrationResult(null)
    setCustodianPK(e.currentTarget.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    ExchangeService.checkRegistration(custodianPK)
      .then(result => {
        console.log('Registration Result', result);
        setRegistrationResult(result);
      })
      .catch(err => {
        setErrorMessage(err.message);
      });
  };

  return (
    <div>
      <p>To test your registration and payment, use the form below.</p>
      {errorMessage ? <p>{errorMessage}</p> : ''}
      <Form onSubmit={handleSubmit}>
        <Form.Control
          onChange={handleChange}
          type="text"
          placeholder="Enter Custodian Public Key"
          id="custodianPublicKey" />
        <Button type='submit'>Check</Button>
      </Form>
      <p>{registrationResult === null ? '' : registrationResult.isRegistered ? 'Custodian is registered. ' : 'Custodian not registered. ' }
      {registrationResult === null ? '' : registrationResult.isPaymentMade? 'Payment is made.' : 'Payment is out standing.' }</p>
    </div>
  );
};
