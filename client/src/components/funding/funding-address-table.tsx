import { Table, TablePaginationConfig, TableProps } from 'antd';
import { FundingAddressDto, FundingAddressService } from '../../open-api';
import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../../store';
import { formatSatoshi } from '../utils/satoshi.tsx';
import { formatDate } from '../utils/date-format.tsx';

export interface PaginationParams {
  current: number;
  pageSize: number;
  total: number;
}

const columns: TableProps<FundingAddressDto>['columns'] = [{
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
}];

const FundingAddressTable = () => {
  const {currentExchange} = useStore();
  const [addresses, setAddresses] = useState<FundingAddressDto[]>();
  const [pagination, setPagination] = useState<PaginationParams>({current: 1, pageSize: 10, total: 0});

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
    console.log(pagination);
    setPagination({
      current: pagination?.current || 1,
      pageSize: pagination?.pageSize || 10,
      total: 0
    });
  };

  useEffect(() => {
    loadAddresses(pagination).then();
  }, [pagination.current, pagination.pageSize]);

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
