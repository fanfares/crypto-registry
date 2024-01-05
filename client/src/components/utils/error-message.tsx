import Form from 'react-bootstrap/Form';

const ErrorMessage = ({ errorMessage }: {
  errorMessage: string | null;
}) => {

  if (!errorMessage) return null;

  return (
    <Form.Text className="text-danger">{errorMessage}</Form.Text>
  );
};

export default ErrorMessage;
