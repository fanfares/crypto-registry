import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Input from '../utils/input';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import InputWithCopyButton from '../utils/input-with-copy-button';
import { ErrorMessage } from '@hookform/error-message';
import { FloatingLabel } from 'react-bootstrap';
import { calculateSha256Hash } from '../../utils/calculate-sha256-hash';
import { CentreLayoutContainer } from '../utils/centre-layout-container';

interface Inputs {
  email: string;
}

const Sha256Converter = () => {

  const { handleSubmit, register, formState: { isValid, errors } } = useForm<Inputs>({
    mode: 'onBlur'
  });

  const [hash, setHash] = useState<string | null>();

  const calculateHash = async (data: Inputs) => {
    setHash(await calculateSha256Hash(data.email));
  };


  const renderForm = () => {
    return (
      <Form onSubmit={handleSubmit(calculateHash)}>
        <FloatingLabel label="Email to hash">
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

        <ButtonPanel>
          <BigButton disabled={!isValid}
                     type="submit">
            Hash Email
          </BigButton>
        </ButtonPanel>
      </Form>
    );
  };

  const renderResult = (result: string) => {
    return (
      <div>
        <InputWithCopyButton text={result} label="Email hash"/>
        <ButtonPanel>
          <BigButton onClick={() => setHash(null)}>
            Hash Another
          </BigButton>
        </ButtonPanel>
      </div>
    );
  };

  return (
    <CentreLayoutContainer>
      <h1>Generate Sha256 Hash</h1>
      <p>Use this tool to generate the SHA256 hash of your email</p>
      {hash ? renderResult(hash) : renderForm()}
    </CentreLayoutContainer>
  );
};

export default Sha256Converter;

