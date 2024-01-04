import { satoshiInBitcoin } from '../../utils/satoshi-in-bitcoin';

export type SatoshiFormat = 'bitcoin' | 'satoshi'

export interface SatoshiProps {
  amount?: number;
}

export const formattedSatoshi = (format: SatoshiFormat, satoshi?: number) => {
  let displayAmount = satoshi ?? 0;

  if (format === 'bitcoin') {
    displayAmount = (displayAmount / satoshiInBitcoin);
  }

  return `${displayAmount.toLocaleString()} ${format === 'bitcoin' ? 'BTC' : 'Satoshi'}`;
};

const Satoshi = ({ amount }: SatoshiProps) => {

  if ( !amount ) {
    return <span>None</span>
  }

  const format: SatoshiFormat = amount < satoshiInBitcoin ? 'satoshi' : 'bitcoin';

  let amountInUnits = amount;
  if (format === 'bitcoin') {
    amountInUnits = (amount / satoshiInBitcoin);
  }

  const displayAmount = Intl.NumberFormat('en-UK').format(amountInUnits);

  return (
    <span>
      {displayAmount} {format === 'bitcoin' ? 'BTC' : 'Satoshi'}
    </span>
  )
}

export default Satoshi
