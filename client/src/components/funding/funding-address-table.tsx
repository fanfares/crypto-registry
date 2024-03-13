import { Table, TableProps } from 'antd';
import { FundingAddressDto, FundingAddressService } from '../../open-api';
import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../../store';
import { formatSatoshi } from '../utils/satoshi.tsx';
import { formatDate } from '../utils/date-format.tsx';

const FundingAddressTable = () => {
  const {currentExchange} = useStore();
  const [addresses, setAddresses] = useState<FundingAddressDto[]>();

  const columns: TableProps<FundingAddressDto>['columns'] = [{
    title: 'Address',
    dataIndex: 'address',
    key: 'address'
  },{
    title: 'Funds',
    dataIndex: 'balance',
    key: 'balance',
    render: (_, address) => {
      return formatSatoshi(address.balance)
    }
  }, {
    title: "Valid From",
    dataIndex: 'validFromDate',
    key: 'validFromDate',
    render: (_, address) => {
      return formatDate(address.validFromDate)
    }
  }];

  if (!currentExchange) {
    return null;
  }

  const loadAddresses = useCallback(async () => {
    try {
      const addresses = await FundingAddressService.query({
        exchangeId: currentExchange?._id,
        page: 1,
        pageSize: 20
      });
      setAddresses(addresses);
    } catch ( err ) {
      console.log('err', err)
    }
  }, [] );

  useEffect(() => {
    loadAddresses().then()
  }, []);

  return (
    <div style={{ maxWidth: '1000px'}}>
      <Table dataSource={addresses} columns={columns} rowKey="_id"/>
    </div>
  );
};

export default FundingAddressTable;
