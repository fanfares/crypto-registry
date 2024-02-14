import { useState } from 'react';
import { Button, Form, Input, Modal, notification } from 'antd';
import { ExchangeService } from '../../open-api';
import { getErrorMessage } from '../../utils';

interface ExchangeForm {
  name: string;
}

interface CreateExchangeProps {
  onSuccess: () => Promise<void>;
}

const CreateExchange = (
  {onSuccess}: CreateExchangeProps
) => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (error: string) => {
    api['error']({
      message: 'Operation Failed',
      description: error
    });
  };

  const showModal = () => {
    setOpen(true);
  };

  const submitForm = async (data: ExchangeForm) => {
    try {
      await ExchangeService.createExchange({
        name: data.name
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
        Create Exchange
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

          <Form.Item<ExchangeForm>
            label="Name"
            name="name"
            rules={[{required: true, message: 'Name is required'}]}>
            <Input placeholder="Exchange Name"/>
          </Form.Item>
        </Form>

      </Modal>
    </>
  );
};

export default CreateExchange;
