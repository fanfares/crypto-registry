import { VerifiedHoldingsDto } from '../open-api';
import { Table, TableColumnProps } from 'antd';
import { formatSatoshi } from './utils/satoshi.tsx';
import { formatDate } from './utils/date-format.tsx';

export interface VerifiedHoldingsTableProps {
  holdings: VerifiedHoldingsDto[];
}

const VerifiedHoldingsTable = ({holdings}: VerifiedHoldingsTableProps) => {

  const columns: TableColumnProps<VerifiedHoldingsDto>[] = [{
    title: 'Exchange Name',
    dataIndex: 'exchangeName',
    key: 'exchangeName'
  }, {
    title: 'Customer Balance',
    dataIndex: 'customerHoldingAmount',
    key: 'customerHoldingAmount',
    render: (_, holding) => {
      return formatSatoshi(holding.customerHoldingAmount);
    }
  }, {
    title: 'Funding Network',
    dataIndex: 'fundingSource',
    key: 'fundingSource'
  }, {
    title: 'Valid From',
    dataIndex: 'fundingAsAt',
    render: (_, holding) => {
      return formatDate(holding.fundingAsAt);
    }
  }];

  return (
    <div style={{maxWidth: '1000px'}}>
      <Table dataSource={holdings} columns={columns}/>
    </div>
  );

};

export default VerifiedHoldingsTable;

