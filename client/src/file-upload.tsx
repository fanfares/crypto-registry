import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useForm } from 'react-hook-form';
import { useStore } from './store';
import CurrentSubmission from './components/current-submission';
import ErrorMessage from './components/error-message';


interface Inputs {
  files: File[],
  exchangeName: string
}

export const FileUpload = () => {

  const { submissionStatus, sendSubmission } = useStore();
  const { handleSubmit, register, getValues, watch, formState: { isValid } } = useForm<Inputs>({
    mode: 'onChange'
  });

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
      <h1>Submission - File Upload</h1>
      <Form onSubmit={handleSubmit(handleSubmission)}>
        <Form.Control type="text"
                      placeholder="Exchange Name"
                      {...register('exchangeName', { required: true })} />

        <Form.Control type="file"
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
          <p>Select a file to show details</p>
        )}
        <div>
          <Button disabled={!isValid}
                  type="submit">
            Submit
          </Button>
          <ErrorMessage />
        </div>
      </Form>
    </>
  );
};
