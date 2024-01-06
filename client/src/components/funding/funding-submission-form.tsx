import React, { useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import Input from '../utils/input';
import InputWithCopyButton from '../utils/input-with-copy-button';
import FundingSubmission from './funding-submission';
import { useFundingStore } from '../../store/use-funding-store';
import ErrorMessage from '../utils/error-message';

interface Inputs {
  addressFile: FileList;
}

export const FundingSubmissionForm = () => {

  const {
    clearErrorMessage,
    docsUrl
  } = useStore();

  const {
    errorMessage,
    createFundingSubmission,
    signingMessage,
    updateSigningMessage,
    isWorking,
    clearUpdate,
    pinnedSubmission,
    currentSubmission
  } = useFundingStore();

  const {
    handleSubmit,
    register,
    formState: {isValid}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  useEffect(() => {
    updateSigningMessage().then();
    clearErrorMessage();
  }, []); // eslint-disable-line

  const handleSubmission = async (data: Inputs) => {
    await createFundingSubmission(data.addressFile[0]);
  };

  if (pinnedSubmission) {
    return <FundingSubmission submission={pinnedSubmission}/>;
  }

  return (
    <>
      <h1>Submit Funding</h1>
      <p>Submit your funding via file upload or use the <a href={docsUrl}>API</a></p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30}}>
          <InputWithCopyButton text={signingMessage || ''} label="Signing Message"></InputWithCopyButton>
          <Form.Text className="text-muted">
            Message to use for signing addresses
          </Form.Text>
        </div>

        <div style={{marginBottom: 30}}>
          <Input type="file"
                 style={{lineHeight: '44px'}}
                 {...register('addressFile', {required: true})} />
          <Form.Text className="text-muted">Funding CSV (2 fields - address holding customer bitcoin and signature
            containing signed message)
          </Form.Text>
        </div>

        <div>
          <ErrorMessage errorMessage={errorMessage}/>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking}
                       type="submit">
              {isWorking ? 'Submitting...' : 'Submit'}
            </BigButton>
            {!currentSubmission ? null : <BigButton
                onClick={clearUpdate}
                type="button">
                Cancel
            </BigButton>}
          </ButtonPanel>
        </div>
      </Form>
    </>

  );
};
