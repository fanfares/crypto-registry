import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../store';
import GlobalErrorMessage from './global-error-message';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import Input from './input';
import { CentreLayoutContainer } from './centre-layout-container';
import { FundingSubmissionDto, Network } from '../open-api';
import InputWithCopyButton from './input-with-copy-button';
import FundingSubmission from './funding-submission';

interface Inputs {
  addressFile: FileList;
}

export const FundingSubmissionForm = () => {

  const {
    createFundingSubmission,
    signingMessage,
    docsUrl,
    isWorking,
    updateSigningMessage
  } = useStore();

  const [submission, setSubmission] = useState<FundingSubmissionDto>();

  const {
    handleSubmit,
    register,
    formState: {isValid}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  useEffect(() => {
    updateSigningMessage().then();
  }, []); // eslint-disable-line

  const handleSubmission = async (data: Inputs) => {
    const newSubmission = await createFundingSubmission(
      data.addressFile[0],
      Network.TESTNET
    );
    if (newSubmission) {
      setSubmission(newSubmission);
    }
  };

  if (submission) {
    return (<>
      <CentreLayoutContainer>
        <FundingSubmission addressSubmission={submission}/>
        <GlobalErrorMessage/>
      </CentreLayoutContainer>
    </>);
  }

  return (
    <CentreLayoutContainer>
      <h1>Submit Funding</h1>
      <p>Submit your customer holdings via file upload or use the <a href={docsUrl}>API</a></p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

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
