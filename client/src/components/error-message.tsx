import Form from 'react-bootstrap/Form';

const ErrorMessage = (props: {
  errorMessage: string;
}) => {

  if (!props.errorMessage) return null;

  return (
    <Form.Text className="text-danger">{props.errorMessage}</Form.Text>
  );
};

export default ErrorMessage;
