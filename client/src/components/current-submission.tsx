import { SubmissionStatus } from '../open-api';
import React from 'react';
import { useStore } from '../store';
import Button from 'react-bootstrap/Button';

const CurrentSubmission = () => {

  const { refreshSubmissionStatus, submissionStatus, clearSubmission } = useStore();

  if (!submissionStatus) {
    return null;
  }

  const renderStatus = () => {
    if (!submissionStatus.submissionStatus) {
      return (<div>Submission is not started</div>);
    }
    switch (submissionStatus.submissionStatus) {
      case SubmissionStatus.UNUSED:
        return (<div>Unused</div>);
      case SubmissionStatus.WAITING_FOR_PAYMENT:
        return (
          <div>
            <p>Waiting for Payment</p>
            <p>Payment Amount {submissionStatus.paymentAmount} btc</p>
            <Button onClick={refreshSubmissionStatus}>Refresh</Button>
          </div>);
      case SubmissionStatus.COMPLETE:
        return (<div>
          <p>Submission is Complete</p>
          <Button onClick={clearSubmission}>Clear</Button>
        </div>);
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
