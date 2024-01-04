import * as React from 'react';
import { VerifiedHoldings } from '@bcr/types';
import FormattedDate from './formatted-date';
import { Text } from '@react-email/components';
import FormattedSatoshi from './formatted-satoshi';

export interface VerificationEmailProps {
  verifiedHoldings: VerifiedHoldings[],
  toEmail: string,
  verificationNodeName: string;
  verificationNodeAddress: string;
}

export const VerificationEmail = ({
                                    verifiedHoldings, toEmail, verificationNodeName
                                  }: VerificationEmailProps) => {
  return (<>
    <Text>Hi {toEmail},</Text>
    <Text>The Crypto Registry Network has verified the following Bitcoin holdings</Text>

    <ul>
      {verifiedHoldings.map(v => (
        <li key={v.holdingId}>
          <FormattedSatoshi amount={v.customerHoldingAmount}/> held at {v.exchangeName} on {v.fundingSource} verified at <FormattedDate dateValue={v.fundingAsAt}/>.
        </li>
      ))}
    </ul>

    <Text>This email was sent by {verificationNodeName}.</Text>
    <Text>Thanks,</Text>
    <Text>The Crypto Registry</Text>
  </>);


};
