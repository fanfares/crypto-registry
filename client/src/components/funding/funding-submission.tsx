import { formatSatoshi } from '../utils/satoshi';
import Input from '../utils/input';
import Form from 'react-bootstrap/Form';
import { FloatingLabel } from 'react-bootstrap';
import InputWithCopyButton from '../utils/input-with-copy-button';
import { FundingSubmissionDto, FundingSubmissionStatus } from '../../open-api';
import { formatDate } from '../utils/date-format';

const FundingSubmission = (
  {submission}: { submission: FundingSubmissionDto | null }
) => {


  if (!submission) {
    return <>No Funding Submission</>;
  }

  let displayStatus: string;
  let submissionSubStatus: string;

  switch (submission.status) {
    case FundingSubmissionStatus.ACCEPTED:
      displayStatus = 'Accepted';
      submissionSubStatus = 'Funding Submission Accepted';
      break;

    case FundingSubmissionStatus.RETRIEVING_BALANCES:
      displayStatus = 'Retrieving Balances';
      submissionSubStatus = 'Reading wallet balance from blockchain';
      break;

    case FundingSubmissionStatus.CANCELLED:
      displayStatus = 'Submission Cancelled';
      submissionSubStatus = 'This submission has been cancelled.  Hit \'Clear\' to resubmit.';
      break;

    case FundingSubmissionStatus.FAILED:
      displayStatus = 'Processing Failed';
      submissionSubStatus = submission.errorMessage ?? 'Processing failed for an unknown reason';
      break;

    case FundingSubmissionStatus.INVALID_SIGNATURES:
      displayStatus = 'Invalid Signature';
      submissionSubStatus = 'The address file contains at least one invalid signature';
      break;

    default:
      displayStatus = 'System Error';
      submissionSubStatus = 'Unexpected submission status';
  }

  let exchangeFundsValue: string;

  if ( submission.status === FundingSubmissionStatus.RETRIEVING_BALANCES) {
    exchangeFundsValue = 'calculating...'
  } else if ( submission.status === FundingSubmissionStatus.ACCEPTED ) {
    exchangeFundsValue = formatSatoshi(submission.totalFunds)
  } else {
    exchangeFundsValue = 'Unknown'
  }

  return (
    <div>

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
        label="Import Date/Time">
        <Input type="text"
               disabled={true}
               value={formatDate(submission.createdDate)}/>
        <Form.Text className="text-muted">
          The date on which the holdings were imported.
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
    </div>
  );
};

export default FundingSubmission;
