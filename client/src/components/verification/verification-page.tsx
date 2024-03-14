import VerificationWidget from './verification-widget.tsx';
import VerifyByUidWidget from './verify-by-uid-widget.tsx';
import { useState } from 'react';
import ButtonAnchor from '../utils/button-anchor.ts';

const VerificationPage = () => {
  const [verifyByUid, setVerifyByUid] = useState<boolean>(false);

  return (
    <>
      <h1>Verification</h1>
      {verifyByUid ?
        <VerifyByUidWidget></VerifyByUidWidget> :
        <div>
          <p>Enter a customer email below to send them an email.</p>
          <VerificationWidget></VerificationWidget>
          <p>Alternatively, click <ButtonAnchor onClick={() => setVerifyByUid(true)}>here</ButtonAnchor> to verify by
            your unique Exchange UUID</p>
        </div> }
    </>
  );
};

export default VerificationPage;
