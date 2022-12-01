import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';

type Inputs = {
  example: string,
  exampleRequired: string,
  size: number
};

export default function TestForm() {
  const {register, handleSubmit, formState: {errors, isValid}} = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = data => {
    console.log(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Form.Control defaultValue="test" {...register('example')} />
      <Form.Control {...register('exampleRequired', {required: true})} />
      <Form.Control type="number" {...register('size', {required: true, max: 10})} />
      {errors.exampleRequired && <span>This field is required</span>}
      <Button disabled={!isValid} type="submit">Submit</Button>
      { isValid ? 'Valid' : 'Invalid'}
    </Form>
  );
}
