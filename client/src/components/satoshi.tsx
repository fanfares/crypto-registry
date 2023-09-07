import { satoshiInBitcoin } from '../utils/satoshi-in-bitcoin';

export type SatoshiFormat = 'bitcoin' | 'satoshi'

export interface SatoshiProps {
  format: SatoshiFormat;
  satoshi?: number;
}

export const formattedSatoshi = (format: SatoshiFormat, satoshi?: number) => {
  let displayAmount = satoshi ?? 0;

  if (format === 'bitcoin') {
    displayAmount = (displayAmount / satoshiInBitcoin);
  }

  return `${displayAmount.toLocaleString()} ${format === 'bitcoin' ? 'BTC' : 'Satoshi'}`;
};

const Satoshi = ({ format, satoshi }: SatoshiProps) => {

  let displayAmount = satoshi ?? 0;

  if (format === 'bitcoin') {
    displayAmount = (displayAmount / satoshiInBitcoin);
  }

  return (
    <span>
      {displayAmount} {format === 'bitcoin' ? 'BTC' : 'Satoshi'}
    </span>
  )
}

export default Satoshi
