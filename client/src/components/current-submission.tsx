import styles from './current-submission.module.css';
import { SubmissionStatus } from '../open-api';
import React, { useEffect } from 'react';
import { useStore, useWebSocket } from '../store';
import Button from 'react-bootstrap/Button';
import { formattedSatoshi } from './satoshi';
import Input from './input';
import Form from 'react-bootstrap/Form';
import { FloatingLabel } from 'react-bootstrap';
import ButtonPanel from './button-panel';
import InputWithCopyButton from './input-with-copy-button';

const CurrentSubmission = () => {

  const {
    setSubmission,
    currentSubmission,
    clearSubmission,
    cancelSubmission,
    nodeAddress,
    errorMessage
  } = useStore();

  const {getSocket} = useWebSocket();

  useEffect(() => {
    getSocket().on('submissions', submissionUpdate => {
      setSubmission(submissionUpdate);
    });

    return () => {
      getSocket().off('submissions');
    };
  }, []); //eslint-disable-line

  if (!currentSubmission) {
    return null;
  }

  let submissionStatus: string;
  let submissionSubStatus: string;
  let showClearButton: boolean;
  let showCancelButton = false;

  switch (currentSubmission.status) {
    case SubmissionStatus.RETRIEVING_WALLET_BALANCE:
      submissionStatus = 'Retrieving Wallet Balance';
      submissionSubStatus = 'Reading wallet balance from blockchain';
      showCancelButton = nodeAddress === currentSubmission.receiverAddress;
      showClearButton = !showCancelButton;
      break;

    case SubmissionStatus.INSUFFICIENT_FUNDS:
      submissionStatus = 'Insufficient Funds - Customers will not be able to verify';
      submissionSubStatus = 'Exchange Wallet has insufficient funds to cover customer holdings';
      showCancelButton = false;
      showClearButton = true;
      break;

    case SubmissionStatus.CANCELLED:
      submissionStatus = 'Submission Cancelled';
      submissionSubStatus = 'This submission has been cancelled.  Hit \'Clear\' to resubmit.';
      showClearButton = true;
      break;

    case SubmissionStatus.WAITING_FOR_CONFIRMATION:
      submissionStatus = 'Waiting for confirmation';
      submissionSubStatus = 'We have received your payment, and are waiting for confirmation from the network';
      showCancelButton = nodeAddress === currentSubmission.receiverAddress;
      showClearButton = !showCancelButton;
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

    case SubmissionStatus.PROCESSING_FAILED:
      submissionStatus = 'Processing Failed';
      submissionSubStatus = currentSubmission.errorMessage ?? 'Processing failed for an unknown reason'
      showClearButton = true;
      break;

    case SubmissionStatus.INVALID_SIGNATURE:
      submissionStatus = 'Invalid Signature';
      submissionSubStatus = 'The address file contains at least one invalid signature';
      showClearButton = true;
      break;

    default:
      submissionStatus = 'System Error';
      submissionSubStatus = 'Unexpected submission status';
      showClearButton = true;
  }

  if (errorMessage) {
    showClearButton = true;
    showCancelButton = false;
  }

  const exchangeFundsValue = currentSubmission.totalExchangeFunds ? formattedSatoshi('satoshi', currentSubmission.totalExchangeFunds) : 'tbc';

  return (
    <div>
      <h2>{currentSubmission.exchangeName} Submission</h2>
      <hr/>
      <FloatingLabel
        label="Submission Status">
        <Input type="text"
               disabled={true}
               value={submissionStatus}/>
        <Form.Text style={currentSubmission.status === SubmissionStatus.PROCESSING_FAILED ? {color: 'red'} : {}}>
          {submissionSubStatus}
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Exchange Funds On-Chain">
        <Input type="text"
               disabled={true}
               value={exchangeFundsValue}/>
        <Form.Text className="text-muted">
          The balance of the wallet submitted by the exchange (at time of submission) detected on-chain
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Customer Claims on Funds">
        <Input type="text"
               disabled={true}
               value={formattedSatoshi('satoshi', currentSubmission.totalCustomerFunds)}/>
        <Form.Text className="text-muted">
          The total amount of customer account balances submitted by the exchange.
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Network Confirmations">
        <Input type="text"
               disabled={true}
               value={currentSubmission.confirmations.length + '/' + (currentSubmission.confirmationsRequired ?? 'tbc')}/>
        <Form.Text className="text-muted">
          The number of nodes in the network who have confirmed against the number required to confirm.
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Network">
        <Input type="text"
               disabled={true}
               value={currentSubmission.network}/>
        <Form.Text className="text-muted">
          The bitcoin network that this submission relates to.
        </Form.Text>
      </FloatingLabel>

      <InputWithCopyButton text={currentSubmission._id}
                           label="Submission Id"
                           subtext="Unique identifier for this submission."/>

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
