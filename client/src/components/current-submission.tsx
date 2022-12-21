import styles from './current-submission.module.css';
import { SubmissionStatus } from '../open-api';
import React from 'react';
import { useStore } from '../store';
import Button from 'react-bootstrap/Button';
import Satoshi from './satoshi';

const CurrentSubmission = () => {

  const {
    refreshSubmissionStatus,
    submissionStatus: submission,
    clearSubmission,
    cancelSubmission,
    isWorking
  } = useStore();

  if (!submission) {
    return null;
  }

  const renderStatus = () => {
    switch (submission.status) {
      case SubmissionStatus.WAITING_FOR_PAYMENT:
        return (
          <div>
            <p>Waiting for Payment from {submission.exchangeName}</p>
            <p>Expected Payment: <Satoshi format="bitcoin" satoshi={submission.paymentAmount} />
              {' '}(<Satoshi format="satoshi" satoshi={submission.paymentAmount} />)
            </p>
            <p>Total Customer Funds: <Satoshi format="bitcoin" satoshi={submission.totalCustomerFunds} /></p>
            <Button className={styles.actionButton}
                    disabled={isWorking}
                    onClick={refreshSubmissionStatus}>{isWorking ? 'Refreshing...' : 'Refresh'}</Button>
            <Button className={styles.actionButton}
                    onClick={cancelSubmission}>Cancel</Button>
          </div>
        );
      case SubmissionStatus.SENDER_MISMATCH:
        return (
          <div>
            <p>Payment has been received from the wrong wallet.</p>
            <p>In order to prove ownership, payment must be made from the wallet provided in the submission.</p>
            <p>The minimum Bitcoin payment of 1000 satoshi is required from the owner's wallet. The remainder may come
              from another wallet</p>
            <p>Expected Payment: <Satoshi format="bitcoin" satoshi={submission.paymentAmount} />
              {' '}(<Satoshi format="satoshi" satoshi={submission.paymentAmount} />)
            </p>
            <Button className={styles.actionButton}
                    disabled={isWorking}
                    onClick={refreshSubmissionStatus}>{isWorking ? 'Refreshing...' : 'Refresh'}</Button>
            <Button className={styles.actionButton}
                    onClick={cancelSubmission}>Cancel</Button>
          </div>
        );
      case SubmissionStatus.INSUFFICIENT_FUNDS:
        return (
          <div>
            <p>Sending Wallet has insufficient funds to cover Customer Holdings.</p>
            <p>Add funds and re-submit.</p>
            <p>{submission.exchangeName}</p>
            <p>Total Exchange Funds: <Satoshi format="bitcoin" satoshi={submission.totalExchangeFunds} /></p>
            <p>Total Customer Funds: <Satoshi format="bitcoin" satoshi={submission.totalCustomerFunds} /></p>
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
      default:
        return (
          <p>Error: Please clear local storage.</p>
        );
    }
  };

  return (
    <div>
      <h2>Your Current Submission</h2>
      <p>Address: {submission.paymentAddress}</p>
      {renderStatus()}
    </div>
  );
};

export default CurrentSubmission;
