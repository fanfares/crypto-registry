import Form from 'react-bootstrap/Form';
import { useForm } from 'react-hook-form';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import Input from '../utils/input';
import { Network } from '../../open-api';
import { useHoldingsStore } from '../../store/use-holding-store';
import ErrorMessage from '../utils/error-message';
import ButtonAnchor from '../utils/button-anchor.ts';
import { useStore } from '../../store';

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
    currentHoldings,
    downloadExampleFile
  } = useHoldingsStore();

  const { loadCurrentExchange } = useStore()

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
    await loadCurrentExchange();
  };

  return (
    <>
      <h1>Submit Customer Balances</h1>
      <p>Submit your Customer Balances via file upload or via the API</p>
      <p>The file is a CSV with 2 fields:</p>
      <ul>
        <li>email - SHA256 of customer's emails address</li>
        <li>amount - balance in satoshi</li>
      </ul>
      <p>Click <ButtonAnchor onClick={downloadExampleFile}>here</ButtonAnchor> download an example file</p>

      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30}}>
          <Input type="file"
                 style={{lineHeight: '44px'}}
                 {...register('holdingsFile', {required: true})} />
          <Form.Text className="text-muted">
            Customer Holdings File (csv)
          </Form.Text>
        </div>

        <div>
          <ErrorMessage errorMessage={errorMessage}/>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking}
                       htmlType="submit">
              {isWorking ? 'Submitting...' : 'Submit'}
            </BigButton>
            {!currentHoldings ? null :
              <BigButton onClick={clearEdit}>
                Cancel
              </BigButton>}
          </ButtonPanel>
        </div>
      </Form>
    </>
  );
};
