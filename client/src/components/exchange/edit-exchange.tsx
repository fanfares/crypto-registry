import { useState } from 'react';
import { Form, Input, Modal, notification } from 'antd';
import { ExchangeDto, ExchangeService } from '../../open-api';
import { getErrorMessage } from '../../utils';

interface ExchangeForm {
  name: string;
}

interface EditExchangeProps {
  onSuccess: () => void;
  onCancel: () => void;
  exchange: ExchangeDto;
  open: boolean;
}

const EditExchange = (
  {onSuccess, onCancel, exchange, open}: EditExchangeProps
) => {
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();

  const openNotification = (error: string) => {
    api['error']({
      message: 'Operation Failed',
      description: error
    });
  };

  const submitForm = async (data: ExchangeForm) => {
    try {
      await ExchangeService.updateExchange(exchange._id, {
        name: data.name
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

  return (
    <>
      {contextHolder}
      <Modal
        title="Edit Exchange"
        centered
        open={open}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}>

        <Form
          initialValues={exchange}
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

export default EditExchange;
