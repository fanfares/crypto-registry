import { useFundingStore } from '../../store/use-funding-store.ts';
import InfoRow, { InfoRowElement } from './info-row.tsx';
import { useMemo } from 'react';

const FundingSubmissionStatusWidget = () => {

  const {fundingSubmissionStatus} = useFundingStore();

  const data: InfoRowElement[] = useMemo(() => [{
    title: 'Active',
    value: fundingSubmissionStatus?.numberOfActiveAddresses.toString() ?? '...'
  }, {
    title: 'Pending',
    value: fundingSubmissionStatus?.numberOfPendingAddresses.toString() ?? '...'
  }, {
    title: 'Failed',
    value: fundingSubmissionStatus?.numberOfFailedAddresses.toString() ?? '...'
  }], [fundingSubmissionStatus]);

  return <InfoRow data={data}/>;
};

export default FundingSubmissionStatusWidget;
