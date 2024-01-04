import { HoldingsSubmissionDto } from '../open-api';
import React from 'react';
import { useStore } from '../store';
import { formattedSatoshi } from './utils/satoshi';
import Input from './input';
import Form from 'react-bootstrap/Form';
import { FloatingLabel } from 'react-bootstrap';
import InputWithCopyButton from './input-with-copy-button';

const HoldingsSubmission = (
  { holdingSubmission }: { holdingSubmission: HoldingsSubmissionDto }
) => {

  const {currentExchange} = useStore();

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
        label="Network">
        <Input type="text"
               disabled={true}
               value={holdingSubmission.network}/>
        <Form.Text className="text-muted">
          The bitcoin network that this submission relates to.
        </Form.Text>
      </FloatingLabel>

      <InputWithCopyButton text={holdingSubmission._id}
                           label="Submission Id"
                           subtext="Unique identifier for this submission."/>

    </div>
  );
};

export default HoldingsSubmission;
