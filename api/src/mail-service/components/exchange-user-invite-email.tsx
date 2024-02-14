import * as React from 'react';
import { Link, Text } from '@react-email/components';
import Signature from './signature';

export interface ExchangeUserInviteProps {
  toEmail: string,
  link: string,
}

export const ExchangeUserInviteEmail = ({
                                          toEmail, link
                                        }: ExchangeUserInviteProps) => {
  return (<>
    <Text>Hi {toEmail},</Text>
    <Text>Welcome to the Customer Deposits Registry.</Text>
    <Text>Please click on the link to set your password.</Text>
    <Link href={link}>Set My Password.</Link>
    <Signature/>
  </>);
};
