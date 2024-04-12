import Form from 'react-bootstrap/Form';
import Input from '../utils/input';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import { RegistrationService } from '../../open-api';
import ErrorMessage from '../utils/errorMessage.ts';
import { getErrorMessage } from '../../utils';

export interface JoinNetworkForm {
  toNodeAddress: string;
}

const JoinNetwork = () => {

  const {
    register,
    handleSubmit,
    formState: {isValid}
  } = useForm<JoinNetworkForm>({
    mode: 'onChange'
  });

  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState('');
  const [requested, setIsRequested] = useState(false);

  const onSubmit: SubmitHandler<JoinNetworkForm> = async data => {
    setIsWorking(true);
    setError('');
    try {
      await RegistrationService.sendRegistration({
        toNodeAddress: data.toNodeAddress
      });
      setIsRequested(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  if (requested) {
    return (
      <>
        <h1>Join Network</h1>
        <p>
          Your request has been submitted. The Network will send you an email shortly to initiate the approval process.
        </p>
      </>
    );
  }

  return (
    <div>
      <h3>Join the Network</h3>
      <p>Enter the address of another node on the network and submit</p>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('toNodeAddress', {
            required: true
          })}
          placeholder="Connection Address"/>

        <ErrorMessage>{error}</ErrorMessage>
        <ButtonPanel>
          <BigButton disabled={!isValid}
                     loading={isWorking}
                     htmlType="submit">
            {isWorking ? 'Submitting...' : 'Submit'}
          </BigButton>
        </ButtonPanel>
      </Form>
    </div>
  );

};

export default JoinNetwork;
