import React, { useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../store';
import CurrentSubmission from './current-submission';
import GlobalErrorMessage from './global-error-message';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import Input from './input';
import { FloatingLabel } from 'react-bootstrap';
import { ErrorMessage } from '@hookform/error-message';
import { CentreLayoutContainer } from './centre-layout-container';
import { Network } from '../open-api';

interface Inputs {
  files: File[];
  exchangeName: string;
  exchangeZpub: string;
}

export const SubmitFile = () => {

  const {
    currentSubmission,
    refreshSubmissionStatus,
    createSubmission,
    docsUrl,
    isWorking,
    validateZpub
  } = useStore();
  const {handleSubmit, register, formState: {isValid, errors}} = useForm<Inputs>({
    mode: 'onBlur'
  });
  const [network, setNetwork] = React.useState<Network | null>(null);

  useEffect(() => {
    refreshSubmissionStatus().then();
  }, []); // eslint-disable-line

  const handleSubmission = async (data: Inputs) => {
    await createSubmission(data.files[0], network ?? Network.TESTNET, data.exchangeName, [data.exchangeZpub]);
  };

  if (currentSubmission) {
    return (<>
      <CentreLayoutContainer>
        <CurrentSubmission/>
        <GlobalErrorMessage/>
      </CentreLayoutContainer>
    </>);
  }

  return (
    <CentreLayoutContainer>
      <h1>Submit Exchange Data</h1>
      <p>Submit your customer holdings via file upload or use the <a href={docsUrl}>API</a></p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30, display: 'flex', flexDirection: 'column'}}>

          <FloatingLabel label="Exchange Name">
            <Form.Control type="text"
                          isInvalid={!!errors?.exchangeName}
                          placeholder="Exchange Name"
                          {...register('exchangeName', {
                            required: 'Exchange Name is required'
                          })} />
          </FloatingLabel>

          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="exchangeName"/>
          </Form.Text>

          <Form.Text className="text-muted">
            Name of the institution holding customer funds
          </Form.Text>
        </div>

        <div style={{marginBottom: 30, display: 'flex', flexDirection: 'column'}}>
          <FloatingLabel label="Exchange Public Key">
            <Form.Control
              type="text"
              isInvalid={!!errors?.exchangeZpub}
              placeholder="Extended Public Key (zpub)"
              {...register('exchangeZpub', {
                required: 'Public Key is required',
                validate: async zpub => {
                  const result = await validateZpub(zpub);
                  if (result.valid) {
                    setNetwork(result.network ?? null);
                    return true;
                  } else {
                    setNetwork(null);
                    return 'Invalid public key';
                  }
                }
              })} />
          </FloatingLabel>

          <Form.Text className="text-danger">
            <ErrorMessage errors={errors} name="exchangeZpub"/>
          </Form.Text>

          <Form.Text className="text-muted">
            Extended Public Key of a Native Segwit Wallet containing the customer funds (see <a
            href="https://river.com/learn/terms/b/bip-84-derivation-paths-for-native-segwit/">BIP84</a> for more info)
          </Form.Text>
        </div>

        {network ?
          <div style={{marginBottom: 30}}>
            <FloatingLabel
              label="Network">
              <Input type="text"
                     disabled={true}
                     value={network}/>
              <Form.Text className="text-muted">
                The network for this Submission.
              </Form.Text>
            </FloatingLabel>
          </div> : null}

        <Input type="file"
               style={{lineHeight: '44px'}}
               {...register('files', {required: true})} />
        <Form.Text className="text-muted">Customer Holdings CSV. Two fields - the hashed customer email (sha256), and
          Bitcoin held by the customer in Satoshi</Form.Text>

        <div>
          <GlobalErrorMessage/>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking}
                       type="submit">
              {isWorking ? 'Submitting...' : 'Submit'}
            </BigButton>
          </ButtonPanel>
        </div>
      </Form>
    </CentreLayoutContainer>
  );
};
