import { format } from 'date-fns';

export const getSigningMessage = () => {
  const date = format(new Date(), 'd MMM yyyy')
  return `I attest that as of ${date} UTC the exchange owns the referenced bitcoin on behalf of the customers specified`;
}
