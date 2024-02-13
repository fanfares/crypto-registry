import VerificationPage from './verification/verification-page.tsx';

const SignedOutHome = () => {
  return (
    <>
      <div style={{marginBottom: '40px'}}>
        <h1>Customer</h1>
        <h1>Deposits</h1>
        <h1>Registry</h1>
      </div>

      <p style={{textAlign: 'justify', marginBottom: '25px'}}>
        Privately verify your balances on exchange. We will send you an
        email if we can positively verify your bitcoin with out verified exchanges.
      </p>

      <VerificationPage></VerificationPage>

    </>
  );
};

export default SignedOutHome;
