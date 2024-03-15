import Form from 'react-bootstrap/Form';
import { Controller, useForm } from 'react-hook-form';
import { useStore } from '../../store';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import Input from '../utils/input';
import { useFundingStore } from '../../store/use-funding-store';
import ErrorMessage from '../utils/error-message';
import ButtonAnchor from '../utils/button-anchor.ts';
import { Spin } from 'antd';

interface Inputs {
  addressFile: FileList;
  resetFunding: boolean;
}

export const FundingSubmissionForm = () => {

  const {
    docsUrl
  } = useStore();

  const {
    errorMessage,
    clearFundingErrorMessage,
    createFundingSubmission,
    isWorking,
    downloadExampleFile,
    setMode,
  } = useFundingStore();

  const {
    handleSubmit,
    register,
    formState: {isValid},
    control
  } = useForm<Inputs>({
    mode: 'onBlur'
  });

  const handleSubmission = async (data: Inputs) => {
    await createFundingSubmission(data.addressFile[0], data.resetFunding);
  };

  return (
    <>
      <h1>Submit On-Chain Funding{isWorking ? <Spin style={{marginLeft: 20}}/> : null}</h1>;
      <p>Submit your On-Chain Funding via file upload or use the <a href={docsUrl}>API</a></p>
      <p>The file is a CSV with 3 fields:</p>
      <ul>
        <li>Hash of a recent Bitcoin Block which will form the message of the signature</li>
        <li>Address holding customer bitcoin</li>
        <li>Signature of the Bitcoin Block Hash</li>
      </ul>
      <p>Click <ButtonAnchor onClick={downloadExampleFile}>here</ButtonAnchor> download an
        example file, or read the documentation for
        example code to generate the file for your wallet.</p>

      <p>If you select 'Reset Exchange Funding' any previous submissions will be deleted, and Exchange funding will
        equal this submission only</p>

      <Form onSubmit={handleSubmit(handleSubmission)}>

        <div style={{marginBottom: 30}}>
          <Input type="file"
                 style={{lineHeight: '44px'}}
                 {...register('addressFile', {required: true})} />
          <Form.Text className="text-muted">
            Submission File (csv)
          </Form.Text>
        </div>

        <div style={{marginBottom: 30}}>
          <Form.Group>
            <Controller
              name="resetFunding"
              control={control}
              defaultValue={false}
              render={({field: {value, ...field}}) => (
                <Form.Check
                  type="checkbox"
                  label="Reset Exchange Funding"
                  {...field}
                />
              )}
            />
          </Form.Group>
        </div>

        <div>
          <ErrorMessage errorMessage={errorMessage}/>
          <ButtonPanel>
            <BigButton disabled={!isValid || isWorking}
                       htmlType="submit">
              {isWorking ? 'Submitting...' : 'Submit'}
            </BigButton>
            <BigButton
              disabled={isWorking}
              onClick={() => {
                clearFundingErrorMessage();
                setMode('showCurrent');
              }}>
              Back
            </BigButton>
          </ButtonPanel>
        </div>
      </Form>
    </>

  );
};
