import { notification, Space, Table, TablePaginationConfig, TableProps, Typography } from 'antd';
import { FundingAddressDto, FundingAddressService } from '../../open-api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store';
import { formatSatoshi } from '../utils/satoshi.tsx';
import { formatDate } from '../utils/date-format.tsx';
import { getErrorMessage } from '../../utils';

export interface PaginationParams {
  current: number;
  pageSize: number;
  total: number;
}

const FundingAddressTable = () => {
  const {currentExchange, loadCurrentExchange} = useStore();
  const [addresses, setAddresses] = useState<FundingAddressDto[]>();
  const [pagination, setPagination] = useState<PaginationParams>({current: 1, pageSize: 10, total: 0});
  const [api, contextHolder] = notification.useNotification();

  if (!currentExchange) {
    return null;
  }

  const loadAddresses = useCallback(async (
    paginationParams: PaginationParams
  ) => {
    try {
      const {addresses, total} = await FundingAddressService.query({
        exchangeId: currentExchange?._id,
        page: paginationParams.current,
        pageSize: paginationParams.pageSize
      });
      setAddresses(addresses);
      setPagination({...paginationParams, total});
    } catch (err) {
      console.log('err', err);
    }
  }, []);


  const handleTableChange = async (pagination: TablePaginationConfig) => {
    setPagination({
      current: pagination?.current || 1,
      pageSize: pagination?.pageSize || 10,
      total: 0
    });
  };

  const errorNotification = (error: string) => {
    api['error']({
      message: 'Operation Failed',
      description: error
    });
  };

  const successNotification = (message: string) => {
    api['success']({
      message: 'Operation Succeeded',
      description: message
    });
  };

  const deleteAddress = async (address: FundingAddressDto) => {
    try {
      await FundingAddressService.deleteAddress(address.address);
      await loadAddresses(pagination);
      await loadCurrentExchange();
      successNotification('User Deleted');
    } catch (err) {
      errorNotification(getErrorMessage(err));
    }
  };


  const columns: TableProps<FundingAddressDto>['columns'] = useMemo(() =>[{
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  }, {
    title: 'Funds',
    dataIndex: 'balance',
    key: 'balance',
    render: (_, address) => {
      return formatSatoshi(address.balance);
    }
  }, {
    title: 'Valid From',
    dataIndex: 'validFromDate',
    key: 'validFromDate',
    render: (_, address) => {
      return formatDate(address.validFromDate);
    }
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, address) => {
      return (
        <Space>
          <Typography.Link onClick={() => deleteAddress(address)}>
            Delete
          </Typography.Link>
        </Space>
      );
    }
  }], [] );

  useEffect(() => {
    loadAddresses(pagination).then();
  }, [pagination.current, pagination.pageSize]);

  return (
    <div style={{maxWidth: '1000px', paddingTop: '10px'}}>
      {contextHolder}
      <Table dataSource={addresses}
             pagination={pagination}
             onChange={handleTableChange}
             columns={columns}
             rowKey="_id"/>
    </div>
  );
};

export default FundingAddressTable;
