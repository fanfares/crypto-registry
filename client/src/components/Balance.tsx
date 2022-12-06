import { Formik } from 'formik';
import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { CryptoService } from '../open-api';

function Balance() {

  const [balance, setBalance] = useState<string>('');
  const [publicKey, setPublicKey] = useState<string>('34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo');

  const getBalance = (pk: string) => {
    CryptoService.getBalance(pk).then(balance => {
      setBalance(balance)
    })
  };

  useEffect(() => getBalance(publicKey), [publicKey]);

  return (
    <div>
      <h1>Get your balance!</h1>
      <Formik
        initialValues={{publicKey}}
        onSubmit={(values, {setSubmitting}) => {
          setPublicKey(values.publicKey);
          getBalance(values.publicKey);
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
            /* and other goodies */
          }) => (

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Public Key</Form.Label>
              <Form.Control onChange={handleChange}
                            name="publicKey"
                            type="text"
                            value={values.publicKey}
                            placeholder="Public Key" />
            </Form.Group>
            <Button variant="primary"
                    disabled={isSubmitting}
                    type="submit">Find</Button>
          </Form>
        )}
      </Formik>
      <h2>Balance: {balance}</h2>
    </div>
  );
}

export default Balance;
