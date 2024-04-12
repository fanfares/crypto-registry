import ErrorMessage from '../utils/error-message.tsx';
import { Button } from 'react-bootstrap';
import { useCallback, useState } from 'react';
import { Form, Input, InputNumber, Select } from 'antd';
import { BitcoinService, FundingFileRequest, Network } from '../../open-api';
import { hyphenatedToRegular } from '../utils/enum.tsx';
import { getErrorMessage } from '../../utils';
import { downloadFile } from '../utils/download-file.ts';

export const TestFundingFile = () => {

  const networks = Object.values(Network);
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [form] = Form.useForm();

  const downloadTestFunding = useCallback(async (data: FundingFileRequest) => {
    setIsWorking(true);
    setErrorMessage('');
    try {
      await downloadFile('/api/tools/test-funding', 'post', data);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
    setIsWorking(false);
  }, []);

  const validateKey = useCallback(async (_: any, value: string) => {
    if ( !value ) {
      return;
    }
    const result = await BitcoinService.validateExtendedKey(value);
    if ( !result.valid) {
      throw new Error('Invalid Key');
    }
  }, []);

  return (
    <>
      <h3>Download Test Funding File</h3>
      <Form
        style={{margin: 10, maxWidth: 400, paddingTop: '10px'}}
        form={form}
        labelCol={{span: 7}}
        wrapperCol={{span: 24}}
        labelAlign={'left'}
        initialValues={{network: Network.TESTNET, lines: 1000}}
        layout="horizontal"
        onFinish={downloadTestFunding}
        autoComplete="off">

        <Form.Item<FundingFileRequest>
          label="Network"
          required={true}
          name="network">
          <Select>
            {networks.map(network =>
              <Select.Option key={network} value={network}>{hyphenatedToRegular(network)}</Select.Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item<FundingFileRequest>
          label="Lines"
          rules={[{required: true, message: 'Lines is required'}]}
          name="lines">
          <InputNumber style={{width: '100%'}} placeholder="Lines"/>
        </Form.Item>

        <Form.Item<FundingFileRequest>
          label="Private Key"
          rules={[{
            required: true, message: 'Key is required'
          }, {
            validator: validateKey
          }]}
          name="extendedKey">
          <Input placeholder="Extended Key Format"/>
        </Form.Item>

        <ErrorMessage errorMessage={errorMessage}/>
        <Button disabled={isWorking}
                style={{width: '140px'}}
                type="submit">
          {isWorking ? 'Downloading...' : 'Download'}
        </Button>
      </Form>

    </>
  );
};

export default TestFundingFile;
