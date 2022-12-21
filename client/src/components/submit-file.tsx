import React, { useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../store';
import CurrentSubmission from './current-submission';
import GlobalErrorMessage from './global-error-message';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import Input from './input';

interface Inputs {
  files: File[];
  exchangeName: string;
  exchangeZpub: string;
}

export const SubmitFile = () => {

  const { submissionStatus, refreshSubmissionStatus, createSubmission, docsUrl, isWorking } = useStore();
  const { handleSubmit, register, watch, formState: { isValid } } = useForm<Inputs>({
    mode: 'onChange'
  });

  useEffect(() => {
    refreshSubmissionStatus().then();
  }, []); // eslint-disable-line

  const handleSubmission = async (data: Inputs) => {
    await createSubmission(data.files[0], data.exchangeName, data.exchangeZpub);
  };

  const files = watch('files');
  const selectedFile = files ? files[0] : null;

  if (submissionStatus) {
    return (<>
      <CurrentSubmission />
      <GlobalErrorMessage />
    </>);
  }

  return (
    <>
      <h1>Submission</h1>
      <p>Submit your customer holdings via file upload or use the <a href={docsUrl}>API</a></p>
      <Form onSubmit={handleSubmit(handleSubmission)}>
        <Input type="text"
               placeholder="Exchange Name"
               {...register('exchangeName', { required: true })} />

        <Form.Text className="text-muted">
          Name of the institution holding customer funds
        </Form.Text>

        <Input type="text"
               placeholder="Extended Public Key (zpub)"
               {...register('exchangeZpub', { required: true })} />

        <Form.Text className="text-muted">
          Extended Public Key of a Native Segwit Wallet containing the customer funds (see <a
          href="https://river.com/learn/terms/b/bip-84-derivation-paths-for-native-segwit/">BIP84</a> for more info)
        </Form.Text>

        <Input type="file"
               {...register('files', { required: true })} />
        <Form.Text className="text-muted">Customer Holdings CSV. Two fields - the hashed customer email (sha256), and
          Bitcoin held by the customer in Satoshi</Form.Text>

        <div>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking}
                       type="submit">
              {isWorking ? 'Submitting...' : 'Submit'}
            </BigButton>
          </ButtonPanel>
          <GlobalErrorMessage />
        </div>
      </Form>
    </>
  );
};
