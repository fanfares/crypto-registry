import { useFundingStore } from '../../store';
import InfoRow, { InfoRowElement } from './info-row.tsx';
import { useMemo } from 'react';

const FundingStatusWidget = () => {

  const {fundingStatus} = useFundingStore();

  const data: InfoRowElement[] = useMemo(() => [{
    title: 'Active',
    value: fundingStatus?.numberOfActiveAddresses.toString() ?? '...'
  }, {
    title: 'Pending',
    value: fundingStatus?.numberOfPendingAddresses.toString() ?? '...'
  }, {
    title: 'Failed',
    value: fundingStatus?.numberOfFailedAddresses.toString() ?? '...'
  }], [fundingStatus]);

  return <InfoRow data={data}/>;
};

export default FundingStatusWidget;
