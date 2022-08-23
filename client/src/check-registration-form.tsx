import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { CustodianService } from './open-api';

export const CheckRegistrationForm = () => {
  const [custodianPK, setCustodianPK] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);

  const handleChange = (e: any) => {
    e.preventDefault();
    setIsRegistered(null)
    setCustodianPK(e.currentTarget.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    CustodianService.checkRegistration(custodianPK)
      .then(result => {
        console.log('is registered', result.isRegistered);
        setIsRegistered(result.isRegistered);
      })
      .catch(err => {
        console.log('failed', err.message);
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
      </Form>
      <pre>{isRegistered}</pre>
      {isRegistered === null ? '' : isRegistered ? <p>Custodian is registered</p> : <p>Custodian is NOT registered</p>}
    </div>
  );
};
