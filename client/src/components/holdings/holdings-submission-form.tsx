import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import Input from '../utils/input';
import { Network } from '../../open-api';
import { useHoldingsStore } from '../../store/use-holding-store';
import ErrorMessage from '../utils/error-message';

interface Inputs {
  holdingsFile: FileList;
  network: Network;
}

export const HoldingsSubmissionForm = () => {
  const {
    errorMessage,
    createHoldingsSubmission,
    isWorking,
    clearEdit,
    currentHoldings
  } = useHoldingsStore();

  const {
    handleSubmit,
    register,
    formState: {isValid}
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  const handleSubmission = async (data: Inputs) => {
    await createHoldingsSubmission(
      data.holdingsFile[0],
      data.network
    );
  };

  return (
    <>
      <h1>Submit Holdings</h1>
      <p>Submit your holdings via file upload or via the API</p>
      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30}}>
          <Input type="file"
                 style={{lineHeight: '44px'}}
                 {...register('holdingsFile', {required: true})} />
          <Form.Text className="text-muted">
            Holding CSV (2 fields - hashedEmail and holding amount in satoshi
          </Form.Text>
        </div>

        <div>
          <ErrorMessage errorMessage={errorMessage}/>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking}
                       type="submit">
              {isWorking ? 'Submitting...' : 'Submit'}
            </BigButton>
            {!currentHoldings ? null :
              <BigButton onClick={clearEdit}
                         type="button">
                Cancel
              </BigButton>}
          </ButtonPanel>
        </div>
      </Form>
    </>
  );
};
