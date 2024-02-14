import { useEffect, useState } from 'react';
import { Button, Checkbox, Form, Input, Modal, notification, Select } from 'antd';
import { ExchangeDto, ExchangeService, UserService } from '../../open-api';
import { getErrorMessage } from '../../utils';

const {Option} = Select;

interface UserForm {
  email: string;
  exchangeId: string;
  isSystemAdmin: boolean;
}

interface CreateUserProps {
  onSuccess: () => Promise<void>;
}

const CreateUser = (
  {onSuccess}: CreateUserProps
) => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [exchanges, setExchanges] = useState<ExchangeDto[]>([]);

  useEffect(() => {
    const getExchanges = async () => setExchanges(await ExchangeService.getAllExchanges());
    getExchanges().then();
  }, []);

  const openNotification = (error: string) => {
    api['error']({
      message: 'Operation Failed',
      description: error
    });
  };

  const showModal = () => {
    setOpen(true);
  };

  const submitForm = async (data: UserForm) => {
    console.log(data);
    try {
      await UserService.createUser({
        email: data.email,
        isSystemAdmin: data.isSystemAdmin ?? false,
        exchangeId: data.exchangeId
      });
      form.resetFields();
      setOpen(false);
      await onSuccess();
    } catch (err) {
      openNotification(getErrorMessage(err));
    }
    setConfirmLoading(false);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    form.submit();
  };

  const handleCancel = () => {
    form.resetFields();
    setOpen(false);
  };

  return (
    <>
      {contextHolder}
      <Button type="primary"
              style={{marginBottom: '10px'}}
              onClick={showModal}>
        Create User
      </Button>
      <Modal
        title="Title"
        centered
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}>

        <Form
          style={{maxWidth: 650}}
          name="basic"
          form={form}
          layout="vertical"
          onFinish={submitForm}
          autoComplete="off">

          <Form.Item<UserForm>
            label="Email"
            name="email"
            rules={[{required: true, message: 'Email is required'}]}>
            <Input placeholder="Email"/>
          </Form.Item>

          <Form.Item<UserForm>
            label="Exchange"
            valuePropName="value"
            name="exchangeId">
            <Select>
              {exchanges.map(exchange =>
                <Option key={exchange._id} value={exchange._id}>{exchange.name}</Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item<UserForm>
            valuePropName="checked"
            name="isSystemAdmin">
            <Checkbox>System Admin</Checkbox>
          </Form.Item>

        </Form>

      </Modal>
    </>
  );
};

export default CreateUser;
