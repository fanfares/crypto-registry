import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export const FileUpload = () => {

  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const changeHandler = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmission = async () => {
    if (selectedFile === null) {
      return;
    }

    setErrorMessage(null);
    setSuccess(false);
    const formData = new FormData();
    formData.append('File', selectedFile);

    fetch(
      '/api/custodian/submit-holdings-csv',
      {
        method: 'POST',
        body: formData
      }
    )
      .then((response) => response.json())
      .then((result) => {
        setSuccess(true)
      })
      .catch((error) => {
        setErrorMessage(error.message);
        console.error('Error:', error);
      });
  };

  return (
    <>
      <h1>Submission - File Upload</h1>
      <Form>
        <Form.Control type="file"
                      name="file"
                      onChange={changeHandler} />

        {selectedFile !== null ? (
          <div>
            <br />
            <div>Filename: {selectedFile.name}</div>
            <div>Filetype: {selectedFile.type}</div>
            <div>Size in bytes: {selectedFile.size}</div>
            <p>
              lastModifiedDate:{' '}
              {selectedFile.lastModifiedDate.toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p>Select a file to show details</p>
        )}
        <div>{errorMessage}</div>
        <div>
          <Button disabled={selectedFile === null}
                  onClick={handleSubmission}
                  type="button">
            Submit
          </Button>
        </div>
        <div>{success ? "Submission has been imported successfully." : ''}</div>
      </Form>
    </>
  );
};
