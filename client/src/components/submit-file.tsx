import React, { useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../store';
import CurrentSubmission from './current-submission';
import ErrorMessage from './error-message';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import Input from './input';

interface Inputs {
  files: File[],
  exchangeName: string
}

export const SubmitFile = () => {

  const { submissionStatus, sendSubmission, docsUrl, clearErrorMessage } = useStore();
  const { handleSubmit, register, watch, formState: { isValid } } = useForm<Inputs>({
    mode: 'onChange'
  });

  useEffect(() => {
    clearErrorMessage()
  }, [] )

  const handleSubmission = async (data: Inputs) => {
    await sendSubmission(data.files[0], data.exchangeName);
  };

  const files = watch('files');
  const selectedFile = files ? files[0] : null;

  if (submissionStatus) {
    return <CurrentSubmission />;
  }

  return (
    <>
      <h1>Submission</h1>
      <p>Submit your customer holdings via file upload or use the <a href={docsUrl}>API</a></p>
      <Form onSubmit={handleSubmit(handleSubmission)}>
        <Input type="text"
               placeholder="Exchange Name"
               {...register('exchangeName', { required: true })} />

        <Input type="file"
               {...register('files', { required: true })} />

        {selectedFile ? (
          <div>
            <br />
            <div>Filename: {selectedFile.name}</div>
            <div>Filetype: {selectedFile.type}</div>
            <div>Size in bytes: {selectedFile.size}</div>
            <p>Last Modified:{' ' + new Date(selectedFile.lastModified).toLocaleDateString()}</p>
          </div>
        ) : (
          <p>Select a file to submit</p>
        )}
        <div>
          <ButtonPanel>
            <BigButton disabled={!isValid} type="submit">Submit</BigButton>
          </ButtonPanel>
          <ErrorMessage />
        </div>
      </Form>
    </>
  );
};
