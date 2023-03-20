import styles from './current-submission.module.css';
import { SubmissionStatus } from '../open-api';
import React, { useEffect } from 'react';
import { useStore } from '../store';
import Button from 'react-bootstrap/Button';
import { formattedSatoshi } from './satoshi';
import Input from './input';
import Form from 'react-bootstrap/Form';
import { FloatingLabel } from 'react-bootstrap';
import ButtonPanel from './button-panel';
import InputWithCopyButton from './input-with-copy-button';

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
    }, 15000);
    return () => clearInterval(intervalId);
  }, []); //eslint-disable-line

  if (!submission) {
    return null;
  }

  let submissionStatus: string;
  let submissionSubStatus: string;
  let showClearButton = false;
  let showCancelButton = false;

  switch (submission.status) {
    case SubmissionStatus.WAITING_FOR_PAYMENT:
      submissionStatus = 'Registry Payment Outstanding';
      submissionSubStatus = `To complete this submission, send ${formattedSatoshi('bitcoin', submission.paymentAmount)} to the above address.`;
      showCancelButton = true;
      break;

    case SubmissionStatus.CANCELLED:
      submissionStatus = 'Submission Cancelled';
      submissionSubStatus = 'This submission has been cancelled.  Hit \'Clear\' to resubmit.';
      showClearButton = true;
      break;

    case SubmissionStatus.INSUFFICIENT_FUNDS:
      submissionStatus = 'Insufficient Funds';
      submissionSubStatus = 'Sending Wallet has insufficient funds to cover Customer Holdings.  Add funds and re-submit.';
      showClearButton = true;
      break;

    case SubmissionStatus.SENDER_MISMATCH:
      submissionStatus = 'Incorrect Payer';
      submissionSubStatus = 'Payment has been received from the wrong wallet. ' +
        'In order to prove ownership, payment must be made from the wallet provided in the submission. ' +
        'The minimum Bitcoin payment of 1000 satoshi is required from the owner\'s wallet. The remainder may come' +
        'from another wallet.';
      showCancelButton = true;
      break;

    case SubmissionStatus.WAITING_FOR_CONFIRMATION:
      submissionStatus = 'Waiting for confirmation';
      submissionSubStatus = 'We have received your payment, and are waiting for confirmation from the network';
      showCancelButton = true;
      break;

    case SubmissionStatus.CONFIRMED:
      submissionStatus = 'Confirmed';
      submissionSubStatus = 'Your submission is confirmed by the network';
      showClearButton = true;
      break;

    case SubmissionStatus.REJECTED:
      submissionStatus = 'Rejected';
      submissionSubStatus = 'Your submission has been rejected by the network';
      showClearButton = true;
      break;

    default:
      submissionStatus = 'Error';
      submissionSubStatus = 'This should never really happen.';
      showClearButton = true;
  }

  return (
    <div>
      <h2>{submission.exchangeName} Submission</h2>
      <hr />
      <FloatingLabel
        label="Submission Status">
        <Input type="text"
               disabled={true}
               value={submissionStatus} />
        <Form.Text className="text-muted">
          {submissionSubStatus}
        </Form.Text>
      </FloatingLabel>

      <InputWithCopyButton text={submission.paymentAddress}
                           label="Payment Address"
                           subtext="Address from which the registry expects payments." />

      <InputWithCopyButton text={formattedSatoshi('bitcoin', submission.paymentAmount)}
                           label="Payment Amount"
                           subtext="The payment made by the exchange to submit to the registry." />

      <FloatingLabel
        label="Network">
        <Input type="text"
               disabled={true}
               value={submission.network} />
        <Form.Text className="text-muted">
          The bitcoin network that this submission relates to.
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Exchange Funds">
        <Input type="text"
               disabled={true}
               value={formattedSatoshi('bitcoin', submission.totalExchangeFunds)} />
        <Form.Text className="text-muted">
          The balance of the wallet submitted by the exchange (at time of submission).
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Customer Funds">
        <Input type="text"
               disabled={true}
               value={formattedSatoshi('bitcoin', submission.totalCustomerFunds)} />
        <Form.Text className="text-muted">
          The total amount of customer funds submitted by the exchange.
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Confirmations">
        <Input type="text"
               disabled={true}
               value={ submission.confirmations.length} />
        <Form.Text className="text-muted">
          The number of nodes in the network who have confirmed this submission.
        </Form.Text>
      </FloatingLabel>

      <ButtonPanel>
        {showClearButton ?
          <Button className={styles.actionButton}
                  onClick={clearSubmission}>Clear</Button>
          : null}

        {showCancelButton ?
          <Button className={styles.actionButton}
                  onClick={cancelSubmission}>Cancel</Button>
          : null}
      </ButtonPanel>
    </div>
  );
};

export default CurrentSubmission;
