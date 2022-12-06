import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Form, Button } from 'react-bootstrap';

type Inputs = {
  example: string,
  exampleRequired: string,
};

export default function TestForm() {
  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<Inputs>({
    mode: 'onChange'
  });
  const onSubmit: SubmitHandler<Inputs> = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input defaultValue="test" {...register("example")} />
      <input {...register("exampleRequired", { required: true })} />
      {errors.exampleRequired && <span>This field is required</span>}

      <input type="submit" disabled={!isValid}/>
    </form>
  );
}
