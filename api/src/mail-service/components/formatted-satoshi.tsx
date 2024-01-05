import * as React from 'react';
import { satoshiInBitcoin } from '../../utils';

const FormattedSatoshi = (
  {amount}: { amount: number | null }
) => {

  if (!amount) {
    return <div>0</div>;
  }

  const formatAsSatoshi = amount < satoshiInBitcoin;

  let amountInUnits = amount;
  if (!formatAsSatoshi) {
    amountInUnits = (amount / satoshiInBitcoin);
  }

  const displayAmount = Intl.NumberFormat('en-UK').format(amountInUnits);
  const displayAmountWithUnits = formatAsSatoshi ? `${displayAmount} Satoshi` : `${displayAmount} BTC`;
  return <span>{displayAmountWithUnits}</span>;
};

export default FormattedSatoshi;
