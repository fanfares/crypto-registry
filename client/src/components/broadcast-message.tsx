import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { SubmitHandler, useForm } from 'react-hook-form';
import Input from './input';
import ButtonPanel from './button-panel';
import BigButton from './big-button';
import ErrorMessage from './error-message';
import { NetworkService } from '../open-api';

export interface MessageForm {
  message: string;
}

const BroadcastMessage = () => {
  const { register, handleSubmit, formState: { isValid } } = useForm<MessageForm>();
  const [error, setError] = useState();

  const sendMessage: SubmitHandler<MessageForm> = async data => {
    try {
      await NetworkService.broadcastMessage({ message: data.message });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Form onSubmit={handleSubmit(sendMessage)}>
      <Input
        {...register('message', {
          required: true
        })}
        type="text"
        placeholder="Broadcast Message"/>
      <ErrorMessage>{error}</ErrorMessage>
      <ButtonPanel>
        <BigButton disabled={!isValid}
                   type="submit">
          Broadcast
        </BigButton>
      </ButtonPanel>
    </Form>
  );

};

export default BroadcastMessage;
