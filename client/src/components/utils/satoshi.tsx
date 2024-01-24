import { satoshiInBitcoin } from '../../utils/satoshi-in-bitcoin';

export type SatoshiFormat = 'bitcoin' | 'satoshi'

export interface SatoshiProps {
  amount?: number;
}

export const formatSatoshi = (amount: number) => {
  if ( amount === 0 ) {
    return "0"
  }

  if ( amount === null ) {
    return '-'
  }

  let displayAmount = amount;

  const format: SatoshiFormat = amount < satoshiInBitcoin ? 'satoshi' : 'bitcoin';

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
