import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import Form from 'react-bootstrap/Form';
import ButtonPanel from './button-panel';
import Button from 'react-bootstrap/Button';
import { validateEmail } from '../utils/is-valid-email';
import { FloatingLabel } from 'react-bootstrap';

type Inputs = {
  email: string,
  data: string,
};

export default function TestForm() {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<Inputs>({
    mode: 'onBlur'
  });
  const onSubmit: SubmitHandler<Inputs> = data => console.log(data);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>

      <Form.Group>
        <Form.Control
          placeholder="Email"
          isInvalid={!!errors?.email}
          {...register('email', {
          validate: validateEmail,
          required: 'Email is required'
        })} />

        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="email"/>
        </Form.Text>
      </Form.Group>


      <FloatingLabel
        controlId="form.data"
        label="Data">
      <Form.Control {...register('data', {
        required: 'Example is required'
      })}/>
      </FloatingLabel>
      <ErrorMessage errors={errors} name="data"/>

      <ButtonPanel>
        <Button type="submit" disabled={!isValid}>Submit</Button>
      </ButtonPanel>
    </Form>
  );
}
