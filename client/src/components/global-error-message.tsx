import { useStore } from '../store';
import ErrorMessage from './error-message';

const GlobalErrorMessage = () => {
  const { errorMessage } = useStore();

  if (!errorMessage) return null;

  return (
    <ErrorMessage>{errorMessage}</ErrorMessage>
  );
};

export default GlobalErrorMessage;
