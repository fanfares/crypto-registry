import * as React from 'react';
import { Link, Text } from '@react-email/components';
import Signature from './signature';

export interface ResetPasswordProps {
  toEmail: string,
  link: string,
}

export const ResetPasswordEmail = ({
                                     toEmail, link
                                   }: ResetPasswordProps) => {
  return (<>
    <Text>Hi {toEmail},</Text>
    <Text>Click the link to reset your password.</Text>
    <Link href={link}>Reset My Password.</Link>
    <Signature/>
  </>);
};
