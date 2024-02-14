import { Space, Table, TableProps, Typography } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { ExchangeDto, ExchangeService, ExchangeStatus } from '../../open-api';
import { useStore } from '../../store';
import { getErrorMessage } from '../../utils';
import Satoshi from '../utils/satoshi.tsx';
import { hyphenatedToRegular } from '../utils/enum.tsx';
import DateFormat from '../utils/date-format.tsx';
import CreateExchange from './create-exchange.tsx';
import EditExchange from './edit-exchange.tsx';

export const ExchangesPage = () => {

  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedExchange, setEditedExchange] = useState<ExchangeDto | null>(null);

  const {setErrorMessage} = useStore();

  const loadData = useCallback(async () => {
    setErrorMessage('');
    try {
      setExchanges(await ExchangeService.getAllExchanges());
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
  }, []);

  const openEditDialog = (exchange: ExchangeDto) => {
    setEditedExchange(exchange);
    setShowEditModal(true);
  };

  const cancelEdit = () => {
    setEditedExchange(null);
    setShowEditModal(false);
  };

  const editSuccess = async () => {
    await loadData();
    setEditedExchange(null);
    setShowEditModal(false);
  };

  useEffect(() => {
    loadData().then();
  }, [setErrorMessage]);

  const columns: TableProps<ExchangeDto>['columns'] = [{
    title: 'Exchange',
    dataIndex: 'name'
  }, {
    title: 'Status',
    dataIndex: 'status',
    render: (status: ExchangeStatus) => hyphenatedToRegular(status)
  }, {
    title: 'Funds',
    dataIndex: 'currentFunds',
    render: (value) => value ? <Satoshi amount={value}/> : '-'
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
    render: (value) => value ? <Satoshi amount={value}/> : '-'
  }, {
    title: 'Holdings Submission Time',
    dataIndex: 'holdingsAsAt',
    render: date => date ? <DateFormat dateStr={date}/> : '-'
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, exchange) => {
      return (
        <Space>
          <Typography.Link onClick={() => openEditDialog(exchange)}>
            Edit
          </Typography.Link>
        </Space>
      );
    }
  }];

  return (
    <>
      <h1>Exchanges</h1>
      {editedExchange ?
        <EditExchange onSuccess={() => editSuccess().then()}
                      onCancel={() => cancelEdit()}
                      exchange={editedExchange}
                      open={showEditModal}/> : null}
      <CreateExchange onSuccess={() => loadData().then()}/>
      <Table dataSource={exchanges} columns={columns} rowKey="_id"/>
    </>
  );
};
