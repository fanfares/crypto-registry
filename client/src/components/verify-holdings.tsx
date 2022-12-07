import { Formik } from 'formik';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import { CustomerService, VerificationResult } from '../open-api';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import Input from './input';

function VerifyHoldings() {

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [email, setEmail] = useState<string>('rob@excal.tv');
  // () => {
  // const savedEmail = localStorage.getItem('email');
  // return savedEmail || '';
  // });
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyHoldings = () => {
    CustomerService.verifyHoldings({
      email: email
    }).then(response => {
      setVerificationResult(response.verificationResult);
    }).catch(err => {
      setErrorMessage(err.body.message);
    });
  };
  let verificationResultDisplay;
  if (verificationResult) {
    verificationResultDisplay = <p>Result: {verificationResult}</p>;
  } else if (errorMessage) {
    verificationResultDisplay = <p>Failed: {errorMessage}</p>;
  } else {
    verificationResultDisplay = '';
  }

  return (
    <div>
      <h1>Verify your Crypto</h1>
      <p>Privately verify your crypto holdings.  We will send you an email if we can positively verify your crypto with a custodian</p>
      <Formik
        initialValues={{ email: email }}
        onSubmit={(values, { setSubmitting }) => {
          setEmail(values.email);
          verifyHoldings();
          setSubmitting(false);
        }}>
        {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (

          <Form onSubmit={handleSubmit}>
              <Input onChange={handleChange}
                            name="email"
                            type="text"
                            value={values.email}
                            placeholder="Your Email" />
            <ButtonPanel>
              <BigButton variant="primary"
                         disabled={isSubmitting || !values.email}
                         type="submit">
                Verify
              </BigButton>
            </ButtonPanel>
          </Form>
          )}
      </Formik>
      <div>{verificationResultDisplay}</div>
    </div>
  );
}

export default VerifyHoldings;
