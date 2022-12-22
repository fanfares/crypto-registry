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

  const {
    submissionStatus,
    refreshSubmissionStatus,
    createSubmission,
    docsUrl,
    isWorking,
    validateZpub
  } = useStore();
  const { handleSubmit, register, formState: { isValid, errors } } = useForm<Inputs>({
    mode: 'onBlur'
  });

  useEffect(() => {
    refreshSubmissionStatus().then();
  }, []); // eslint-disable-line

  const handleSubmission = async (data: Inputs) => {
    await createSubmission(data.files[0], data.exchangeName, data.exchangeZpub);
  };

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
               isInvalid={errors.exchangeName}
               placeholder="Exchange Name"
               {...register('exchangeName', { required: true })} />

        {errors.exchangeName?.type === 'required' &&
          <Form.Control.Feedback type="invalid">
            Exchange Name is required
          </Form.Control.Feedback>
        }

        <Form.Text className="text-muted">
          Name of the institution holding customer funds
        </Form.Text>

        <Input type="text"
               isInvalid={errors.exchangeZpub}
               placeholder="Extended Public Key (zpub)"
               {...register('exchangeZpub', {
                 required: true,
                 validate: {
                   validZpub: async (v) => await validateZpub(v)
                 }
               })} />

        {errors.exchangeZpub?.type === 'validZpub' &&
          <Form.Control.Feedback type="invalid">
            Invalid Extended Public Key
          </Form.Control.Feedback>
        }

        {errors.exchangeZpub?.type === 'required' &&
          <Form.Control.Feedback type="invalid">
            Extended Public Key is required
          </Form.Control.Feedback>
        }

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
