import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export const FileUpload = () => {

  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  const changeHandler = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmission = async () => {
    if (selectedFile === null) {
      return;
    }

    const formData = new FormData();
    formData.append('File', selectedFile);
    formData.append('Other', 'data');

    fetch(
      '/api/custodian/submit-holdings-csv',
      {
        method: 'POST',
        body: formData
      }
    )
      .then((response) => response.json())
      .then((result) => {
        console.log('Success:', result);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <>
      <h1>File Upload Skeleton</h1>
      <Form>
        <Form.Control type="file"
                      name="file"
                      onChange={changeHandler} />

        {selectedFile !== null ? (
          <div>
            <p>Filename: {selectedFile.name}</p>
            <p>Filetype: {selectedFile.type}</p>
            <p>Size in bytes: {selectedFile.size}</p>
            <p>
              lastModifiedDate:{' '}
              {selectedFile.lastModifiedDate.toLocaleDateString()}
            </p>
          </div>
        ) : (
          <p>Select a file to show details</p>
        )}
        <div>
          <Button disabled={selectedFile === null}
                  onClick={handleSubmission}
                  type="button">
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
};
