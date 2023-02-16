import { useStore } from '../store';
import Error from './error';

const GlobalErrorMessage = () => {
  const { errorMessage } = useStore();

  if (!errorMessage) return null;

  return (
    <Error>{errorMessage}</Error>
  );
};

export default GlobalErrorMessage;
