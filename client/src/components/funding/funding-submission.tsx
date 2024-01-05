import React from 'react';
import { useStore } from '../../store';
import { formattedSatoshi } from '../utils/satoshi';
import Input from '../utils/input';
import Form from 'react-bootstrap/Form';
import { FloatingLabel } from 'react-bootstrap';
import InputWithCopyButton from '../utils/input-with-copy-button';
import { FundingSubmissionDto, FundingSubmissionStatus } from '../../open-api';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import { useFundingStore } from '../../store/use-funding-store';

const FundingSubmission = (
  {submission}: { submission: FundingSubmissionDto | null }
) => {

  const {currentExchange} = useStore();

  const {clearUpdate, cancelUpdate, errorMessage} = useFundingStore();

  if (!submission) {
    return <>No Funding Submission</>;
  }

  let displayStatus: string;
  let submissionSubStatus: string;
  let showClearButton: boolean;
  let showCancelButton = false;

  switch (submission.status) {
    case FundingSubmissionStatus.ACCEPTED:
      displayStatus = 'Accepted';
      submissionSubStatus = 'Funding Submission Accepted';
      showCancelButton = false;
      showClearButton = false;
      break;

    case FundingSubmissionStatus.RETRIEVING_BALANCES:
      displayStatus = 'Retrieving Balances';
      submissionSubStatus = 'Reading wallet balance from blockchain';
      showCancelButton = true;
      showClearButton = !showCancelButton;
      break;

    case FundingSubmissionStatus.CANCELLED:
      displayStatus = 'Submission Cancelled';
      submissionSubStatus = 'This submission has been cancelled.  Hit \'Clear\' to resubmit.';
      showClearButton = true;
      break;

    case FundingSubmissionStatus.FAILED:
      displayStatus = 'Processing Failed';
      submissionSubStatus = submission.errorMessage ?? 'Processing failed for an unknown reason';
      showClearButton = true;
      break;

    case FundingSubmissionStatus.INVALID_SIGNATURES:
      displayStatus = 'Invalid Signature';
      submissionSubStatus = 'The address file contains at least one invalid signature';
      showClearButton = true;
      break;

    default:
      displayStatus = 'System Error';
      submissionSubStatus = 'Unexpected submission status';
      showClearButton = true;
  }

  if (errorMessage) {
    showClearButton = true;
    showCancelButton = false;
  }

  const exchangeFundsValue = submission.totalFunds ? formattedSatoshi('satoshi', submission.totalFunds) : 'tbc';

  return (
    <div>
      <h2>{currentExchange?.name} Funding</h2>
      <hr/>
      <FloatingLabel
        label="Submission Status">
        <Input type="text"
               disabled={true}
               value={displayStatus}/>
        <Form.Text style={submission.status === FundingSubmissionStatus.FAILED ? {color: 'red'} : {}}>
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
        label="Network">
        <Input type="text"
               disabled={true}
               value={submission.network}/>
        <Form.Text className="text-muted">
          The bitcoin network that this submission relates to.
        </Form.Text>
      </FloatingLabel>

      <InputWithCopyButton text={submission._id}
                           label="Submission Id"
                           subtext="Unique identifier for this submission."/>

      <ButtonPanel>
        {showClearButton ?
          <BigButton onClick={clearUpdate}>Clear</BigButton>
          : null}

        {showCancelButton ?
          <BigButton onClick={() => cancelUpdate().then()}>Cancel</BigButton>
          : null}
      </ButtonPanel>

    </div>
  );
};

export default FundingSubmission;
