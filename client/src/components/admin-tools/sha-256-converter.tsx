import { useForm } from 'react-hook-form';
import React, { useRef, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Input from '../utils/input';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import InputWithCopyButton from '../utils/input-with-copy-button';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import { calculateSha256Hash } from '../../utils/calculate-sha256-hash';

interface Inputs {
  email: string;
}

const Sha256Converter = () => {

  const {handleSubmit
    ,
    register,
    setValue,
    setFocus,
    formState: {isValid, errors}} = useForm<Inputs>({
    mode: 'onBlur'
  });

  const [hash, setHash] = useState<string | null>();

  const calculateHash = async (data: Inputs) => {
    setHash(await calculateSha256Hash(data.email));
  };

  const hashAnother = () => {
    setValue('email', '')
    setHash(null);
    setFocus('email');
  };

  return (
    <>
      <h1>Email Hash Generator</h1>
      <p>Use this tool to generate the SHA256 hash of your email</p>
      <Form onSubmit={handleSubmit(calculateHash)}>
        <FloatingLabel label="Email to Hash">
          <Input type="text"
                 isInvalid={errors.email}
                 placeholder="Email"
                 {...register('email', {
                   required: 'Email is required',
                   pattern: {
                     value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                     message: 'Please enter a valid email'
                   }
                 })} />
        </FloatingLabel>

        <Form.Text className="text-danger">
          <ErrorMessage errors={errors} name="email"/>
        </Form.Text>

        {errors.email?.type === 'pattern' &&
            <Form.Control.Feedback type="invalid">
                Email is required
            </Form.Control.Feedback>
        }

        <InputWithCopyButton text={hash ?? ''} label="Email hash"/>

        <ButtonPanel>
          {!hash ? <BigButton disabled={!isValid}
                              type="submit">
            Hash Email
          </BigButton> : null}
          {hash ? <BigButton onClick={hashAnother}>
            Hash Another
          </BigButton> : null}
        </ButtonPanel>
      </Form>
    </>
  );
};

export default Sha256Converter;

