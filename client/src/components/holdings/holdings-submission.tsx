import { HoldingsSubmissionDto } from '../../open-api';
import React from 'react';
import { useStore } from '../../store';
import { formattedSatoshi } from '../utils/satoshi';
import Input from '../utils/input';
import Form from 'react-bootstrap/Form';
import { FloatingLabel } from 'react-bootstrap';
import InputWithCopyButton from '../utils/input-with-copy-button';
import { formatDate } from '../utils/date-format';

const HoldingsSubmission = (
  {holdingSubmission}: { holdingSubmission: HoldingsSubmissionDto | null }
) => {

  const {currentExchange} = useStore();

  if (!holdingSubmission) {
    return (
      <div>No Holdings Defined</div>
    );
  }

  return (
    <div>
      <h2>{currentExchange?.name} Holdings</h2>
      <hr/>

      <FloatingLabel
        label="Customer Claims on Funds">
        <Input type="text"
               disabled={true}
               value={formattedSatoshi('satoshi', holdingSubmission.totalHoldings)}/>
        <Form.Text className="text-muted">
          The total amount of customer account balances submitted by the exchange.
        </Form.Text>
      </FloatingLabel>

      <FloatingLabel
        label="Import Date/Time">
        <Input type="text"
               disabled={true}
               value={formatDate(holdingSubmission.createdDate)}/>
        <Form.Text className="text-muted">
          The date on which the holdings were imported.
        </Form.Text>
      </FloatingLabel>

      <InputWithCopyButton text={holdingSubmission._id}
                           label="Submission Id"
                           subtext="Unique identifier for this submission."/>

    </div>
  );
};

export default HoldingsSubmission;