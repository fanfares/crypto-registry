import { ServiceTestResultDto } from '../../open-api';
import ErrorMessage from '../utils/error-message.tsx';

export interface ServiceTestResultProps {
  name: string;
  result?: ServiceTestResultDto;
}

const ServiceTestResult = (
  {result, name}: ServiceTestResultProps
) => {

  return (
    <>
      <div>{name}: {!result ? 'TBC' : result.passed ? 'ok' : 'failed'}</div>
      {result?.errorMessage ? <ErrorMessage errorMessage={result.errorMessage}/>: null}
    </>);
};

export default ServiceTestResult;
