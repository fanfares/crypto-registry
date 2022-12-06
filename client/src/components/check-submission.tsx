import styles from './check-submission.module.css';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import CurrentSubmission from './current-submission';
import { useStore } from '../store';

export const CheckSubmission = () => {
  const { loadSubmission } = useStore();
  const [paymentAddress, setPaymentAddress] = useState<string>('');

  const handleChange = (e: any) => {
    e.preventDefault();
    setPaymentAddress(e.currentTarget.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadSubmission(paymentAddress);
  };

  return (
    <div>
      <p>To check the status of your submissions, please enter the payment address.</p>
      <Form onSubmit={handleSubmit}>
        <Form.Control
          onChange={handleChange}
          type="text"
          placeholder="Enter the payment address"
          id="paymentAddress" />
        <div className={styles.buttonPanel}>
          <Button className={styles.loadButton} type="submit">Check</Button>
        </div>
      </Form>
      <CurrentSubmission />
    </div>
  );
};
