import { useStore } from '../store';
import Form from 'react-bootstrap/Form';

const GlobalErrorMessage = () => {
  const { errorMessage } = useStore();

  if (!errorMessage) return null;

  return (
    <Form.Text className="text-danger">{errorMessage}</Form.Text>
  );
};

export default GlobalErrorMessage;
