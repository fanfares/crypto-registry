import InfoRow, { InfoRowElement } from './info-row.tsx';
import { useStore } from '../../store';
import { hyphenatedToRegular } from '../utils/enum.tsx';
import { formatSatoshi } from '../utils/satoshi.tsx';
import { formatDate } from '../utils/date-format.tsx';
import { getExchangeStatusDescription } from '../exchange/get-exchange-status-description.ts';
import { useMemo } from 'react';

const FundingInfoRow = () => {

  const {currentExchange} = useStore();

  if ( !currentExchange ) {
    return 'Loading...'
  }

  const infoRow: InfoRowElement[] = useMemo(() => [{
    title: 'Status',
    value: hyphenatedToRegular(currentExchange?.status ?? ''),
    span: 2
  }, {
    title: 'Funds On-Chain',
    value: formatSatoshi(currentExchange?.currentFunds ?? 0)
  }, {
    title: 'Valid From',
    value: formatDate(currentExchange?.fundingAsAt)
  }, {
    title: 'Network',
    value: hyphenatedToRegular(currentExchange?.fundingSource ?? '')
  }], [currentExchange]);

  return (
    <div style={{paddingTop: '10px'}}>
      <InfoRow data={infoRow}/>
      <p>{getExchangeStatusDescription(currentExchange?.status)}</p>
    </div>
  );
};

export default FundingInfoRow;
