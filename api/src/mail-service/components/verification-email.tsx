import * as React from 'react';
import { VerifiedHoldings } from '@bcr/types';
import FormattedDate from './formatted-date';
import { Text } from '@react-email/components';
import FormattedSatoshi from './formatted-satoshi';
import Signature from './signature';

export interface VerificationEmailProps {
  verifiedHoldings: VerifiedHoldings[],
  toEmail: string,
  institutionName: string;
}

export const VerificationEmail = ({
                                    verifiedHoldings, toEmail, institutionName
                                  }: VerificationEmailProps) => {
  return (<>
    <Text>Hi {toEmail},</Text>
    <Text>The Customer Deposits Registry has verified the following bitcoin balances.</Text>

    <ul>
      {verifiedHoldings.map(v => (
        <li key={v.holdingId}>
          <FormattedSatoshi amount={v.customerHoldingAmount}/> held at {v.exchangeName} on {v.fundingSource} verified at <FormattedDate dateValue={v.fundingAsAt}/>.
        </li>
      ))}
    </ul>

    <Text>This email was sent by {institutionName}.</Text>
    <Signature/>
  </>);


};
