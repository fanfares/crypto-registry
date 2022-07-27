import { Formik } from 'formik';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import React, { useState } from 'react';
import { WalletVerificationDto, CustomerHoldingService } from './open-api';
import WalletVerification from './wallet-verification';

function VerifyWallet() {

  const [walletVerificationDto, setWalletVerificationDto] = useState<WalletVerificationDto | null>(null);
  const [email, setEmail] = useState<string>('rob@flexearn.com');

  const verifyWallet = () => {
    CustomerHoldingService.verifyWallet({
      hashedEmail: email
    }).then(result => {
      setWalletVerificationDto(result);
    });
  };

  // useEffect(() => verifyWallet(), [email]);

  let verificationResult;
  if (walletVerificationDto) {
    verificationResult = <WalletVerification walletVerificationDto={walletVerificationDto} />;
  } else {
    verificationResult =
      <div>
        No result
      </div>;
  }

  return (
    <div>
      <h1>Bitcoin Custodian Registry</h1>
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
            /* and other goodies */
          }) => (

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Verify your holdings</Form.Label>
              <Form.Control onChange={handleChange}
                            name="email"
                            type="text"
                            value={values.email}
                            placeholder="Public Key" />
            </Form.Group>
            <Button variant="primary"
                    disabled={isSubmitting}
                    type="submit">Verify</Button>
          </Form>
        )}
      </Formik>
      <div className="pt-3">{verificationResult}</div>
    </div>
  );
}

export default VerifyWallet;
