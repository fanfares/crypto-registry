import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import { FloatingLabel } from 'react-bootstrap';
import MyErrorMessage from '../utils/error-message';
import { ErrorMessage } from '@hookform/error-message';
import { AddressDto, BitcoinService, WalletDto } from '../../open-api';
import { getErrorMessage } from '../../utils';
import { Col, Row, Table, TableProps } from 'antd';
import { hyphenatedToRegular } from '../utils/enum.tsx';
import Satoshi from '../utils/satoshi.tsx';

interface Inputs {
  extendedKey: string;
}

const columns: TableProps<AddressDto>['columns'] = [{
  title: 'Index',
  dataIndex: 'index'
}, {
  title: 'Type',
  render: (_, address: AddressDto) => hyphenatedToRegular(address.type)
}, {
  title: 'Address',
  dataIndex: 'address'
}, {
  title: 'Balance',
  dataIndex: 'balance',
  render: (_, address: AddressDto) => <Satoshi amount={address.balance} zeroString="0"/>
}]


const ViewWallet = () => {

  const {validateExtendedKey, isWorking} = useStore();
  const [localIsWorking, setLocalIsWorking] = useState(false);
  const [error, setError] = useState<string>('');
  const [wallet, setWallet] = useState<WalletDto | null>(null);

  const {
    handleSubmit,
    register,
    formState: {isValid, errors}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  const handleSubmission = async (data: Inputs) => {
    setLocalIsWorking(true);
    setError('');
    try {
      setWallet(await BitcoinService.generateAddresses({extendedKey: data.extendedKey}));
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLocalIsWorking(false);
  };

  return (
    <>
      <h1>View Wallet</h1>
      <p>Use this utility to view how our code views a wallet</p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 20, display: 'flex', flexDirection: 'column'}}>
          <FloatingLabel label="Extended Key">
            <Form.Control
              style={{maxWidth: '600px'}}
              type="text"
              isInvalid={!!errors?.extendedKey}
              placeholder="Extended Key"
              {...register('extendedKey', {
                required: 'Extended Key is required',
                validate: async key => {
                  setError('');
                  const result = await validateExtendedKey(key);
                  if (!result.valid) {
                    return 'Invalid key';
                  }
                }
              })} />

            <Form.Text className="text-muted">
              Extended Key of Wallet
            </Form.Text>

          </FloatingLabel>

          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="extendedKey"/>
          </Form.Text>

        </div>

        {wallet ? <>
          <Row gutter={[16, 16]} >
            <Col span={2}><span style={{color: 'grey'}}>Network</span></Col>
            <Col span={3}><span style={{color: 'grey'}}>Balance</span></Col>
            <Col span={3}><span style={{color: 'grey'}}>Derivation Path</span></Col>
            <Col span={3}><span style={{color: 'grey'}}>Script Type</span></Col>
            <Col span={3}><span style={{color: 'grey'}}>Type</span></Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginBottom: 20}}>
            <Col span={2}>{hyphenatedToRegular(wallet.network)}</Col>
            <Col span={3}><Satoshi amount={wallet.balance} zeroString="0"/></Col>
            <Col span={3}>{wallet.derivationPath}</Col>
            <Col span={3}>{wallet.scriptType}</Col>
            <Col span={3}>{wallet.typeDescription}</Col>
          </Row>
          <Table dataSource={wallet.addresses}
                 columns={columns}
                 rowKey="_id"/>

        </> : null}

        <div>
          <MyErrorMessage errorMessage={error}/>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking || localIsWorking}
                       type="submit">
              {localIsWorking ? 'Generating...' : 'Generate'}
            </BigButton>
          </ButtonPanel>
        </div>
      </Form>
    </>
  );
};

export default ViewWallet;
