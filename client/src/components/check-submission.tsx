import React, { useEffect, useState } from 'react';
import { FloatingLabel, Form } from 'react-bootstrap';
import { useStore } from '../store';
import GlobalErrorMessage from './global-error-message';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import Input from './input';
import { useNavigate } from 'react-router-dom';
import { CentreLayoutContainer } from './centre-layout-container';

export const CheckSubmission = () => {
  const { loadSubmission, clearErrorMessage, isWorking } = useStore();
  const [submissionId, setSubmissionId] = useState<string>('');
  const nav = useNavigate();

  useEffect(() => {
    clearErrorMessage();
  }, []); // eslint-disable-line

  const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmissionId(e.currentTarget.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSubmissionStatus = await loadSubmission(submissionId);
    if (newSubmissionStatus) {
      nav('/submit-file');
    }
  };

  return (
    <CentreLayoutContainer>
      <h1>Check Submission</h1>
      <p>To check the status of your submissions, please enter the Submission Id.</p>
      <Form onSubmit={handleSubmit}>
        <FloatingLabel label="Submission Id">
          <Input
            required
            onChange={handleChange}
            type="text"
            placeholder="Enter the Submission Id"
            id="submissionId"/>
        </FloatingLabel>
        <GlobalErrorMessage/>
        <ButtonPanel>
          <BigButton
            disabled={isWorking}
            type="submit">{isWorking ? 'Checking...' : 'Check'}</BigButton>
        </ButtonPanel>
      </Form>
    </CentreLayoutContainer>
  );
};
