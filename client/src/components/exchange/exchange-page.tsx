import { Table, TableProps } from 'antd';
import { useEffect, useState } from 'react';
import { ExchangeDto, ExchangeService, ExchangeStatus } from '../../open-api';
import { useStore } from '../../store';
import { getErrorMessage } from '../../utils';
import Satoshi from '../utils/satoshi.tsx';
import { hyphenatedToRegular } from '../utils/enum.tsx';
import DateFormat from '../utils/date-format.tsx';

export const ExchangePage = () => {

  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
  const {setErrorMessage} = useStore();

  useEffect(() => {
    const loadData = async () => {
      setErrorMessage('');
      try {
        const exchanges = await ExchangeService.getAllExchanges();
        setExchanges(exchanges);
      } catch (err) {
        setErrorMessage(getErrorMessage(err));
      }
    };
    loadData().then();
  }, [setErrorMessage]);

  const columns: TableProps<ExchangeDto>['columns'] = [{
    title: 'Exchange',
    dataIndex: 'name'
  }, {
    title: 'Status',
    dataIndex: 'status',
    render: (status: ExchangeStatus) =>  hyphenatedToRegular(status)
  }, {
    title: 'Funds',
    dataIndex: 'currentFunds',
    render: (value) =>  value ? <Satoshi amount={value}/> : '-'
  }, {
    title: 'Funding Source',
    dataIndex: 'fundingSource',
    render: source => source ? hyphenatedToRegular(source) : '-'
  }, {
    title: 'Funding Submission Time',
    dataIndex: 'fundingAsAt',
    render: date => date ? <DateFormat dateStr={date}/> : '-'
  }, {
    title: 'Holdings',
    dataIndex: 'currentHoldings',
    render: (value) =>  value ? <Satoshi amount={value}/> : '-'
  }, {
    title: 'Holdings Submission Time',
    dataIndex: 'holdingsAsAt',
    render: date => date ? <DateFormat dateStr={date}/> : '-'
  }];

  return (
    <Table dataSource={exchanges} columns={columns} rowKey="_id"/>
  );
};
