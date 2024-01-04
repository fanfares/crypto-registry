import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import { useStore } from '../../store';
import HoldingsSubmission from './holdings-submission';
import GlobalErrorMessage from '../utils/global-error-message';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import Input from '../utils/input';
import { CentreLayoutContainer } from '../utils/centre-layout-container';
import { HoldingsSubmissionDto, Network } from '../../open-api';
import { FloatingLabel } from 'react-bootstrap';

interface Inputs {
  holdingsFile: FileList;
  network: Network;
}

export const HoldingsSubmissionForm = () => {
  const [submission, setSubmission] = useState<HoldingsSubmissionDto>();

  const {
    createHoldingsSubmission,
    isWorking
  } = useStore();

  const {
    handleSubmit,
    register,
    formState: {isValid, errors}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  const handleSubmission = async (data: Inputs) => {
    const newSubmission = await createHoldingsSubmission(
      data.holdingsFile[0],
      data.network
    );
    if (newSubmission) {
      setSubmission(newSubmission);
    }
  };

  if (submission) {
    return (<>
      <CentreLayoutContainer>
        <HoldingsSubmission holdingSubmission={submission}/>
        <GlobalErrorMessage/>
      </CentreLayoutContainer>
    </>);
  }

  return (
    <CentreLayoutContainer>
      <h1>Submit Holdings</h1>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30}}>
          <Input type="file"
                 style={{lineHeight: '44px'}}
                 {...register('holdingsFile', {required: true})} />
          <Form.Text className="text-muted">
            Holding CSV (2 fields - hashedEmail and holding amount in satoshi
          </Form.Text>
        </div>

        <div style={{marginBottom: 30}}>
          <FloatingLabel label="Your email">
            <Form.Select {...register('network', {required: true})}>
              <option value={Network.TESTNET}>Testnet</option>
              <option value={Network.MAINNET}>Mainnet</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Network where funding exists
            </Form.Text>
          </FloatingLabel>
        </div>

        <div>
          <GlobalErrorMessage/>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking}
                       type="submit">
              {isWorking ? 'Submitting...' : 'Submit'}
            </BigButton>
          </ButtonPanel>
        </div>
      </Form>
    </CentreLayoutContainer>
  );
};
