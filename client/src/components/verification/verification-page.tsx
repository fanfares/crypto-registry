import Form from 'react-bootstrap/Form';
import { useEffect, useState } from 'react';
import { VerificationService } from '../../open-api';
import BigButton from '../utils/big-button.tsx';
import ButtonPanel from '../utils/button-panel';
import { useStore } from '../../store';
import { SubmitHandler, useForm } from 'react-hook-form';
import { validateEmail } from '../../utils/is-valid-email';
import Error from '../utils/error';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import Input from '../utils/input';
import { getErrorMessage } from '../../utils';

export interface FormInputs {
  email: string;
}

function VerificationPage() {

  const {customerEmail, setCustomerEmail, clearErrorMessage} = useStore();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationNode, setVerificationNode] = useState<string>();
  const {register, handleSubmit, formState: {isValid, errors}} = useForm<FormInputs>({
    mode: 'onChange',
    defaultValues: {
      email: customerEmail
    }
  });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isWorking, setIsWorking] = useState<boolean>(false);
  // const [verifications, setVerifications] = useState<VerificationDto[]>();
  //
  // const debouncedChangeHandler = useMemo(
  //   () => debounce(async () => {
  //     setIsWorking(true);
  //     try {
  //       const verifications = await VerificationService.getVerificationsByEmail(getValues('email'));
  //       setVerifications(verifications);
  //     } catch (err) {
  //       setErrorMessage(err.message);
  //     }
  //     setIsWorking(false);
  //   }, 500)
  //   , [getValues]);

  // const loadVerifications = async () => {
  //   setIsWorking(true);
  //   try {
  //     const verifications = await VerificationService.getVerificationsByEmail(customerEmail);
  //     setVerifications(verifications);
  //   } catch (err) {
  //     setErrorMessage(err.message);
  //   }
  //   setIsWorking(false);
  // };

  useEffect(() => {
    clearErrorMessage();
    // const subscription = watch(debouncedChangeHandler);
    // loadVerifications().then();
    //
    // getSocket().on('verifications', async (verification: VerificationDto) => {
    //   if (verification.hashedEmail === await calculateSha256Hash(customerEmail)) {
    //     loadVerifications().then();
    //   }
    // });
    //
    // return () => {
    //   debouncedChangeHandler.cancel();
    // subscription.unsubscribe();
    // };
  }, []); // eslint-disable-line

  const onSubmit: SubmitHandler<FormInputs> = async data => {
    setIsWorking(true);
    setErrorMessage('');
    setCustomerEmail(data.email);
    try {
      const res = await VerificationService.createVerification({email: data.email});
      setVerificationNode(res.leaderAddress);
      setIsVerified(true);
      // loadVerifications().then();
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  if (isVerified) {
    return (<>
      <h1>Verify Customer Balances</h1>
      <p>Your holdings have been verified. Node {verificationNode} will send an email to {customerEmail} with your
        verified balances</p>
      <ButtonPanel>
        <BigButton onClick={() => setIsVerified(false)}>Verify Again</BigButton>
      </ButtonPanel>
      <br/>
      {/*{verifications ? <VerificationTable verifications={verifications}/> : null}*/}
    </>);
  }

  return (
    <>
      <h1>Verify Customer Balances</h1>
      <p>Privately verify your balances on exchange. We will send you an
        email if we can positively verify your bitcoin with the custodian.</p>
      <Form onSubmit={handleSubmit(onSubmit)}>

        <FloatingLabel label="Your email">
          <Input
            isInvalid={!!errors?.email}
            {...register('email', {
              required: true,
              validate: validateEmail
            })}
            type="text"
            placeholder="Your Email"/>
        </FloatingLabel>

        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="email"/>
        </Form.Text>

        <ButtonPanel>
          <BigButton disabled={!isValid}
                     loading={isWorking}
                     htmlType="submit">
            {isWorking ? 'Verifying...' : 'Verify'}
          </BigButton>
        </ButtonPanel>
      </Form>
      <ButtonPanel>
        {errorMessage ? <Error>{errorMessage}</Error> : null}
      </ButtonPanel>

      {/*{verifications ? <VerificationTable verifications={verifications}/> : null}*/}
    </>
  );
}

export default VerificationPage;
