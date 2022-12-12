import { satoshiInBitcoin } from '../utils/satoshi-in-bitcoin';

export interface SatoshiProps {
  format: 'bitcoin' | 'satoshi'
  satoshi?: number
}

const Satoshi = ({ format, satoshi }: SatoshiProps) => {

  let displayAmount = satoshi ?? 0;

  if ( format === 'bitcoin') {
    displayAmount = (displayAmount / satoshiInBitcoin)
  }

  return (
    <span>
      {displayAmount} {format}
    </span>
  )
}

export default Satoshi
