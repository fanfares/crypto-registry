import Form from 'react-bootstrap/Form';
import React, { useEffect, useState, useMemo } from 'react';
import { ApiError, VerificationDto, VerificationService } from '../open-api';
import BigButton from './big-button';
import ButtonPanel from './button-panel';
import { useStore, useWebSocket } from '../store';
import { SubmitHandler, useForm } from 'react-hook-form';
import { validateEmail } from '../utils/is-valid-email';
import Error from './error';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import debounce from 'lodash.debounce';
import { VerificationTable } from './verification-table';
import { calculateSha256Hash } from '../utils/calculate-sha256-hash';
import { CentreLayoutContainer } from './centre-layout-container';

export interface FormInputs {
  email: string;
}

function VerificationPage() {

  const { customerEmail, setCustomerEmail, clearErrorMessage } = useStore();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationNode, setVerificationNode] = useState<string>();
  const { register, handleSubmit, formState: { isValid, errors }, watch, getValues } = useForm<FormInputs>({
    mode: 'onChange',
    defaultValues: {
      email: customerEmail
    }
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  const [verifications, setVerifications] = useState<VerificationDto[]>();
  const { getSocket } = useWebSocket();

  const debouncedChangeHandler = useMemo(
    () => debounce(async () => {
      setIsWorking(true);
      try {
        const verifications = await VerificationService.getVerificationsByEmail(getValues('email'));
        setVerifications(verifications);
      } catch (err) {
        setErrorMessage(err.message);
      }
      setIsWorking(false);
    }, 500)
    , [getValues]);

  const loadVerifications = async () => {
    setIsWorking(true);
    try {
      const verifications = await VerificationService.getVerificationsByEmail(customerEmail);
      setVerifications(verifications);
    } catch (err) {
      setErrorMessage(err.message);
    }
    setIsWorking(false);
  };

  useEffect(() => {
    clearErrorMessage();
    const subscription = watch(debouncedChangeHandler);
    loadVerifications().then();

    getSocket().on('verifications', async (verification: VerificationDto) => {
      if (verification.hashedEmail === await calculateSha256Hash(customerEmail)) {
        loadVerifications().then();
      }
    });

    return () => {
      debouncedChangeHandler.cancel();
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line

  const onSubmit: SubmitHandler<FormInputs> = async data => {
    setIsWorking(true);
    setErrorMessage('');
    setCustomerEmail(data.email);
    try {
      const res = await VerificationService.createVerification({ email: data.email });
      setVerificationNode(res.leaderAddress);
      setIsVerified(true);
      loadVerifications().then();
    } catch (err) {
      let errorMessage = err.message;
      if (err instanceof ApiError) {
        errorMessage = err.body.message;
      }
      setErrorMessage(errorMessage);
    }
    setIsWorking(false);
  };

  if (isVerified) {
    return (<CentreLayoutContainer>
      <h1>Verify your Bitcoin</h1>
      <p>Your holdings have been verified. Node {verificationNode} will send an email to {customerEmail} with your
        verified holdings</p>
      <ButtonPanel>
        <BigButton onClick={() => setIsVerified(false)}>Verify Again</BigButton>
      </ButtonPanel>
      <br />
      {verifications ? <VerificationTable verifications={verifications} /> : null}
    </CentreLayoutContainer>);
  }

  return (
    <CentreLayoutContainer>
      <h1>Verify Bitcoin Holdings</h1>
      <p>Privately verify your bitcoin holdings. We will send you an
        email if we can positively verify your bitcoin with a custodian</p>
      <Form onSubmit={handleSubmit(onSubmit)}>

        <FloatingLabel label="Your email">
          <Form.Control
            isInvalid={!!errors?.email}
            {...register('email', {
              required: true,
              validate: validateEmail
            })}
            type="text"
            placeholder="Your Email" />
        </FloatingLabel>

        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="email" />
        </Form.Text>

        <ButtonPanel>
          <BigButton variant="primary"
                     disabled={!isValid || isWorking}
                     type="submit">
            {isWorking ? 'Verifying...' : 'Verify'}
          </BigButton>
        </ButtonPanel>
      </Form>
      <ButtonPanel>
        {errorMessage ? <Error>{errorMessage}</Error> : null}
      </ButtonPanel>

      {verifications ? <VerificationTable verifications={verifications} /> : null}
    </CentreLayoutContainer>
  );
}

export default VerificationPage;
