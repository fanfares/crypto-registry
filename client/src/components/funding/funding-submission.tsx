import { formatSatoshi } from '../utils/satoshi';
import Input from '../utils/input';
import Form from 'react-bootstrap/Form';
import { FloatingLabel } from 'react-bootstrap';
import InputWithCopyButton from '../utils/input-with-copy-button';
import { FundingSubmissionDto, FundingSubmissionStatus } from '../../open-api';
import { formatDate } from '../utils/date-format';
import { hyphenatedToRegular } from '../utils/enum.tsx';

const FundingSubmission = (
  {submission}: { submission: FundingSubmissionDto | null }
) => {

  if (!submission) {
    return <>No Funding Submission</>;
  }

  let submissionSubStatus: string;
  switch (submission.status) {
    case FundingSubmissionStatus.WAITING_FOR_PROCESSING:
      submissionSubStatus = 'Waiting to retrieve balances';
      break;

    case FundingSubmissionStatus.ACCEPTED:
      submissionSubStatus = 'Funding Submission Accepted';
      break;

    case FundingSubmissionStatus.PROCESSING:
      submissionSubStatus = 'Reading wallet balance from blockchain';
      break;

    case FundingSubmissionStatus.CANCELLED:
      submissionSubStatus = 'This submission has been cancelled.  Hit \'Clear\' to resubmit.';
      break;

    case FundingSubmissionStatus.FAILED:
      submissionSubStatus = submission.errorMessage ?? 'Processing failed for an unknown reason';
      break;

    case FundingSubmissionStatus.INVALID_SIGNATURES:
      submissionSubStatus = 'The address file contains at least one invalid signature';
      break;

    default:
      submissionSubStatus = 'Unexpected submission status';
  }

  let exchangeFundsValue: string

  if ( submission.status === FundingSubmissionStatus.PROCESSING) {
    exchangeFundsValue = 'retrieving balances...'
  } else if ( submission.status === FundingSubmissionStatus.WAITING_FOR_PROCESSING ) {
    exchangeFundsValue = 'waiting...'
  } else if ( submission.status === FundingSubmissionStatus.ACCEPTED ) {
    exchangeFundsValue = formatSatoshi(submission.totalFunds)
  } else {
    exchangeFundsValue = 'Failed'
  }

  return (
    <div>

      <FloatingLabel
        label="Submission Status">
        <Input type="text"
               disabled={true}
               value={hyphenatedToRegular(submission.status)}/>
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
