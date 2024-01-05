import Form from 'react-bootstrap/Form';

const ErrorMessage = ({ errorMessage }: {
  errorMessage: string | null;
}) => {

  if (!errorMessage) return null;

  return (
    <div><Form.Text className="text-danger">{errorMessage}</Form.Text></div>
  );
};

export default ErrorMessage;
