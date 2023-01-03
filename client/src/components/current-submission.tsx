import styles from './current-submission.module.css';
import { SubmissionStatus } from '../open-api';
import React, { useEffect } from 'react';
import { useStore } from '../store';
import Button from 'react-bootstrap/Button';
import Satoshi from './satoshi';
import TextClipboard from './text-clipboard';

const CurrentSubmission = () => {

  const {
    refreshSubmissionStatus,
    submissionStatus: submission,
    clearSubmission,
    cancelSubmission
  } = useStore();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (submission?.status === SubmissionStatus.WAITING_FOR_PAYMENT) {
        await refreshSubmissionStatus();
      }
    }, 10000);
    return () => clearInterval(intervalId);
  });

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
            <p>Expected Payment: <Satoshi format="bitcoin" satoshi={submission.paymentAmount} />{' '}(<Satoshi
              format="satoshi" satoshi={submission.paymentAmount} />)
            </p>
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
            <p>Payment Received: <Satoshi format="bitcoin" satoshi={submission.paymentAmount} />{' '}(<Satoshi
              format="satoshi" satoshi={submission.paymentAmount} />)</p>
            <p>Customer Funds: <Satoshi format="bitcoin" satoshi={submission.totalCustomerFunds} />{' '}(<Satoshi
              format="satoshi" satoshi={submission.totalCustomerFunds} />)</p>
            <p>Exchange Funds: <Satoshi format="bitcoin" satoshi={submission.totalExchangeFunds} />{' '}(<Satoshi
              format="satoshi" satoshi={submission.totalExchangeFunds} />)</p>
            <Button className={styles.actionButton}
                    onClick={clearSubmission}>Clear</Button>
          </div>
        );
      case SubmissionStatus.CANCELLED:
        return (
          <div>
            <p>Submission Cancelled.</p>
            <Button className={styles.actionButton}
                    onClick={clearSubmission}>Clear</Button>
          </div>
        );
      default:
        return (
          <>
            <p>There was an Error. Please clear local storage, and refresh this page.</p>
            <p>{JSON.stringify(submission, null, 2)}</p>
          </>
        );
    }
  };

  return (
    <div>
      <h2>Your Current Submission</h2>
      <div className={styles.paymentAddress}>Payment Address: <TextClipboard text={submission.paymentAddress} /></div>
      {renderStatus()}
    </div>
  );
};

export default CurrentSubmission;
