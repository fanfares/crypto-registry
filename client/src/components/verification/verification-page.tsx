import VerificationWidget from './verification-widget.tsx';
import VerifyByUidWidget from './verify-by-uid-widget.tsx';

const VerificationPage = () => {
  return (
    <>
      <h1>Verification</h1>
      <p>Enter a customer email below to send them an email.</p>
      <VerificationWidget></VerificationWidget>
      <VerifyByUidWidget></VerifyByUidWidget>
    </>
  );
};

export default VerificationPage;
