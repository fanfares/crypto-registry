import VerifyByEmailWidget from './verify-by-email-widget.tsx';
import VerifyByUidWidget from './verify-by-uid-widget.tsx';
import { useState } from 'react';
import ButtonAnchor from '../utils/button-anchor.ts';

const VerificationWidget = () => {
  const [verifyByUid, setVerifyByUid] = useState<boolean>(false);

  return (
    <>
      {verifyByUid ?
        <VerifyByUidWidget></VerifyByUidWidget> :
        <div>
          <p>Enter a customer email below to send them an email.</p>
          <VerifyByEmailWidget></VerifyByEmailWidget>
          <p>Alternatively, click <ButtonAnchor onClick={() => setVerifyByUid(true)}>here</ButtonAnchor> to verify by
            your unique Exchange UUID</p>
        </div> }
    </>
  );
};

export default VerificationWidget;
