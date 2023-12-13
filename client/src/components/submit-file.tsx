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
import InputWithCopyButton from './input-with-copy-button';

interface Inputs {
  holdingsFile: FileList;
  addressFile: FileList;
  exchangeName: string;
}

export const SubmitFile = () => {

  const {
    currentSubmission,
    refreshSubmissionStatus,
    signingMessage,
    createSubmission,
    docsUrl,
    isWorking,
    updateSigningMessage
  } = useStore();
  const {
    handleSubmit,
    register,
    formState: {isValid, errors}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  useEffect(() => {
    updateSigningMessage().then();
    refreshSubmissionStatus().then();
  }, []); // eslint-disable-line

  const handleSubmission = async (data: Inputs) => {
    await createSubmission(
      data.holdingsFile[0],
      data.addressFile[0],
      Network.TESTNET,
      data.exchangeName
    );
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

            <Form.Text className="text-muted">
              Name of the institution holding customer funds
            </Form.Text>

            <Form.Text className="text-danger">
              <ErrorMessage errors={errors} name="exchangeName"/>
            </Form.Text>
          </FloatingLabel>
        </div>

        <div style={{marginBottom: 30}}>
          <InputWithCopyButton text={signingMessage || ''} label="Signing Message"></InputWithCopyButton>
          <Form.Text className="text-muted">
            Name of the institution holding customer funds
          </Form.Text>
        </div>

        <div style={{marginBottom: 30}}>
          <Input type="file"
                 style={{lineHeight: '44px'}}
                 {...register('addressFile', {required: true})} />
          <Form.Text className="text-muted">Customer Holdings CSV (2 fields - hashed customer email (sha256), and
            Bitcoin held by the customer in Satoshi</Form.Text>
        </div>

        <div style={{marginBottom: 30}}>
          <Input type="file"
                 style={{lineHeight: '44px'}}
                 {...register('holdingsFile', {required: true})} />
          <Form.Text className="text-muted">Address CSV (2 fields - address containing bitcoin and signature</Form.Text>
        </div>

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
