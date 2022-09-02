import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { CustodianService, RegistrationCheckResult } from './open-api';
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
    CustodianService.checkRegistration(custodianPK)
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
      <h5>Test Registration</h5>
      {errorMessage ? <p>{errorMessage}</p> : ''}
      <Form onSubmit={handleSubmit}>
        <Form.Label htmlFor="custodianPublicKey">Enter the Custodian Public Key (and press enter)</Form.Label>
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
