const ErrorMessage = ({errorMessage}: {
  errorMessage: string | null;
}) => {

  if (!errorMessage) return null;

  return (
    <div style={{paddingTop: 10, paddingBottom: 10, color: '#ff4d4f'}}>
      {errorMessage}
    </div>
  );
};

export default ErrorMessage;
