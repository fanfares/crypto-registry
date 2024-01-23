import { useEffect, useState } from 'react';
import { AutoComplete, Checkbox, Form, Input, Modal, notification } from 'antd';
import { ExchangeDto, ExchangeService, UserDto, UserService } from '../../open-api';
import { getErrorMessage } from '../../utils';

interface UserForm {
  email: string;
  isSystemAdmin: boolean;
  exchangeId: string;
}

interface EditUserProps {
  onSuccess: () => void;
  onCancel: () => void;
  user: UserDto;
  open: boolean;
}

const EditUser = (
  {onSuccess, onCancel, user, open}: EditUserProps
) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [exchanges, setExchanges] = useState<ExchangeDto[]>();
  const [filteredExchanges, setFilteredExchanges] = useState<ExchangeDto[]>();

  useEffect(() => {
    const getExchanges = async () => {
      setExchanges(await ExchangeService.getAllExchanges());
    };
    getExchanges().then();
  }, []);

  const openNotification = (error: string) => {
    api['error']({
      message: 'Operation Failed',
      description: error
    });
  };

  const submitForm = async (data: UserForm) => {
    try {
      await UserService.updateUser(user._id, {
        email: data.email,
        isSystemAdmin: data.isSystemAdmin
      });
      onSuccess();
      form.resetFields();
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
    onCancel();
  };

  const onSearch = (searchText: string) => {
    if (exchanges) {
      setFilteredExchanges(exchanges.filter(
        entity => entity.name.toLowerCase().includes(searchText.toLowerCase())));
    }

  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit User"
        centered
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}>

        <Form
          initialValues={user}
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

            <AutoComplete
              options={filteredExchanges}
              onSearch={onSearch}
              placeholder="Exchange"
            />
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

export default EditUser;
