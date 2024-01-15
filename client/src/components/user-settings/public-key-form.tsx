import { Button, Form } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import { useCallback, useEffect, useState } from 'react';
import { UserSettingsService } from '../../open-api';
import { getErrorMessage } from '../../utils';
import ErrorMessage from '../utils/error-message.tsx';

type UserSettingsFormType = {
  publicKey?: string;
};

const PublicKeyForm = () => {
  const [ form ] = Form.useForm();
  const [isWorking, setIsWorking] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const savePublicKey = useCallback(async (values: UserSettingsFormType) => {
    try {
      if (values.publicKey) {
        setIsWorking(true);
        setErrorMessage('');
        await UserSettingsService.savePublicKey({
          publicKey: values.publicKey
        });
        setIsWorking(false);
      }
    } catch (err) {
      setIsWorking(false);
      setErrorMessage(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    const loadPublicKey = async () => {
      try {
        setIsWorking(true);
        setErrorMessage('');
        const result = await UserSettingsService.getPublicKey();
        form.setFieldsValue({
          publicKey: result.publicKey
        })
        setIsWorking(false);
      } catch (err) {
        setIsWorking(false);
        setErrorMessage(getErrorMessage(err));
      }
    };
    loadPublicKey().then();
  }, []);

  return (
    <>
      <h1>User Settings</h1>
      <h5>API Authentication</h5>
      <p>Entry must be a valid RSA Key of length 2048. See <a style={{color: 'blue' }}>documentation</a> for API usage.</p>

      <Form
        style={{maxWidth: 650}}
        name="basic"
        form={form}
        onFinish={savePublicKey}
        autoComplete="off">

        <Form.Item<UserSettingsFormType>
          label="Public Key"
          name="publicKey"
          rules={[{required: true, message: 'Your public key is required'}]}>
          <TextArea
            rows={10}
            placeholder="Cut/Paste your public key here"/>
        </Form.Item>


        <Form.Item>
          <Button type="primary"
                  disabled={isWorking}
                  htmlType="submit">
            Save
          </Button>
        </Form.Item>

      </Form>

      <ErrorMessage errorMessage={errorMessage}/>
    </>
  );
};

export default PublicKeyForm;

