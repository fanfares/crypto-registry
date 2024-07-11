import { Space, Table, TablePaginationConfig, TableProps, Typography } from 'antd';
import { FundingAddressDto, FundingAddressService, FundingAddressStatus } from '../../open-api';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFundingStore, useStore } from '../../store';
import { formatSatoshi } from '../utils/satoshi.tsx';
import { formatDate } from '../utils/date-format.tsx';
import { getErrorMessage } from '../../utils';
import { hyphenatedToRegular } from '../utils/enum.tsx';
import { errorNotification, successNotification } from '../../utils/notification-utils.ts';

export interface PaginationParams {
  current: number;
  pageSize: number;
  total: number;
}

const FundingAddressTable = () => {
  const {currentExchange, loadCurrentExchange} = useStore();
  const [addresses, setAddresses] = useState<FundingAddressDto[]>();
  const [pagination, setPagination] = useState<PaginationParams>({current: 1, pageSize: 10, total: 0});

  const {isProcessing, deleteAddress, isWorking} = useFundingStore();

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

  const deleteAddressClick = useCallback(async (address: FundingAddressDto) => {
    try {
      await deleteAddress(address.address);
      await loadAddresses(pagination);
      successNotification('User Deleted');
    } catch (err) {
      errorNotification(getErrorMessage(err));
    }
  }, []);

  const handleRefreshAddress = useCallback(async (address: FundingAddressDto) => {
    try {
      await FundingAddressService.refreshAddress({address: address.address});
      await loadAddresses(pagination);
      await loadCurrentExchange();
      successNotification(address.address + ' refreshed');
    } catch (err) {
      errorNotification(getErrorMessage(err));
    }
  }, []);

  const columns: TableProps<FundingAddressDto>['columns'] = useMemo(() => [{
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    render: (_, address) => {
      if (address.status === FundingAddressStatus.FAILED) {
        return (<>
          <div>{address.address}</div>
          <div style={{color: 'red', fontSize: 'smaller'}}>{address.failureMessage}</div>
        </>);
      }
      return address.address;
    }
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (_, address) => {
      return hyphenatedToRegular(address.status);
    }
  }, {
    title: 'Funds',
    dataIndex: 'balance',
    key: 'balance',
    render: (_, address) => {
      return address.status === FundingAddressStatus.PENDING ? '...' : formatSatoshi(address.balance);
    }
  }, {
    title: 'Signature Date',
    dataIndex: 'signatureDate',
    key: 'signatureDate',
    render: (_, address) => {
      return address.status === FundingAddressStatus.PENDING ? '...' : formatDate(address.signatureDate);
    }
  }, {
    title: 'Balance Date',
    dataIndex: 'balanceDate',
    key: 'balanceDate',
    render: (_, address) => {
      return address.status === FundingAddressStatus.PENDING ? '...' : formatDate(address.balanceDate);
    }
  }, {
    title: 'Actions',
    key: 'actions',
    render: (_, address) => {
      return (
        <Space>
          <Typography.Link onClick={() => deleteAddressClick(address)}>
            Delete
          </Typography.Link>
          <Typography.Link onClick={() => handleRefreshAddress(address)}>
            Refresh
          </Typography.Link>
        </Space>
      );
    }
  }], []);

  useEffect(() => {
    loadAddresses(pagination).then();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadAddresses(pagination).then();
  }, [isProcessing, isWorking]);

  return (
    <div style={{maxWidth: '1000px', paddingTop: '10px'}}>
      <Table dataSource={addresses}
             pagination={pagination}
             onChange={handleTableChange}
             columns={columns}
             rowKey="_id"/>
    </div>
  );
};

export default FundingAddressTable;
