import { Formik } from 'formik';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import { CustomerService, VerificationResult } from './open-api';

function VerifyWallet() {

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [email, setEmail] = useState<string>('rob@bitcoincustodianregistry.org');
  // () => {
  // const savedEmail = localStorage.getItem('email');
  // return savedEmail || '';
  // });
  const [errorMessage, setErrorMessage] = useState<string>('');

  const verifyWallet = () => {
    CustomerService.verifyHoldings({
      email: email
    }).then(response => {
      setVerificationResult(response.verificationResult);
    }).catch(err => {
      setErrorMessage(err.body.message);
    });
  };

  // useEffect(() => {
  //   localStorage.setItem('email', email);
  // }, [email]);

  let verificationResultDisplay;
  if (verificationResult) {
    verificationResultDisplay = <p>Result: {verificationResult}</p>;
  } else if (errorMessage) {
    verificationResultDisplay = <p>Failed: {errorMessage}</p>;
  } else {
    verificationResultDisplay =
      <div>
        No result yet
      </div>;
  }

  return (
    <div>
      <Formik
        initialValues={{email: email}}
        onSubmit={(values, {setSubmitting}) => {
          setEmail(values.email);
          verifyWallet();
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
            <Form.Group className="mb-3">
              <Form.Label>Verify your holdings</Form.Label>
              <Form.Control onChange={handleChange}
                            name="email"
                            type="text"
                            value={values.email}
                            placeholder="Your Email" />
            </Form.Group>
            <Button variant="primary"
                    disabled={isSubmitting || !values.email}
                    type="submit">
              Verify
            </Button>
          </Form>
        )}
      </Formik>
      <div>{verificationResultDisplay}</div>
    </div>
  );
}

export default VerifyWallet;
