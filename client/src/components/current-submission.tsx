import styles from './current-submission.module.css';
import { SubmissionStatus } from '../open-api';
import React from 'react';
import { useStore } from '../store';
import Button from 'react-bootstrap/Button';

const CurrentSubmission = () => {

  const {
    refreshSubmissionStatus,
    submissionStatus,
    clearSubmission,
    cancelSubmission
  } = useStore();

  if (!submissionStatus) {
    return null;
  }

  const renderStatus = () => {
    if (!submissionStatus.status) {
      return (<div>Submission is not started</div>);
    }
    switch (submissionStatus.status) {
      case SubmissionStatus.UNUSED:
        return (<div>Unused</div>);
      case SubmissionStatus.WAITING_FOR_PAYMENT:
        return (
          <div>
            <p>Waiting for Payment from {submissionStatus.exchangeName}</p>
            <p>Expected Payment Amount: {submissionStatus.paymentAmount} bitcoin</p>
            <p>Total Customer Funds: {submissionStatus.totalCustomerFunds} bitcoin</p>
            <Button className={styles.actionButton}
                    onClick={refreshSubmissionStatus}>Refresh</Button>
            <Button className={styles.actionButton}
                    onClick={cancelSubmission}>Cancel</Button>
          </div>
        );
      case SubmissionStatus.INSUFFICIENT_FUNDS:
        return (
          <div>
          <p>Submission complete, but NOT verified</p>
          <p>Sending Address has insufficient funds. </p>
          <p>Total Exchange Funds: {submissionStatus.totalExchangeFunds} bitcoin</p>
          <p>Total Customer Funds: {submissionStatus.totalCustomerFunds} bitcoin</p>
          <Button className={styles.actionButton}
                  onClick={clearSubmission}>Clear</Button>
        </div>
        );
      case SubmissionStatus.VERIFIED:
        return (
          <div>
            <p>Submission is Complete and Verified.</p>
            <Button className={styles.actionButton}
                    onClick={clearSubmission}>Clear</Button>
          </div>
        );
    }
  };

  return (
    <div>
      <h2>Your Current Submission</h2>
      <p>Address: {submissionStatus.paymentAddress}</p>
      {renderStatus()}
    </div>
  );
};

export default CurrentSubmission;
