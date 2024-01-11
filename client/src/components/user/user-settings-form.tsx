import { Button, Form, Input } from 'antd';

const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

type FieldType = {
  publicKey?: string;
};
//
// const formItemLayout = {
//   labelCol: {span: 4},
//   wrapperCol: {span: 14}
// };


const UserSettingsForm = () => (
  <>
    <h1>User Settings</h1>
    <p>Setup your API Access by saving you Public Key</p>

    <Form
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off">

      <Form.Item<FieldType>
        label="Public Key"
        name="publicKey"
        rules={[{required: true, message: 'Please input your public key'}]}>
        <Input  placeholder="input placeholder" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>

    </Form>
  </>
);

export default UserSettingsForm;

