import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ApprovalStatus, RegistrationService, RegistrationStatusDto } from '../../open-api';
import ErrorMessage from '../utils/errorMessage.ts';
import { RegistrationDetail } from './registration-detail';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button.tsx';
import { getErrorMessage } from '../../utils';


export const InitiateApprovals = () => {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<string>();
  const [isWorking, setIsWorking] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatusDto>();

  const loadRegistration = async () => {
    try {
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        setToken(tokenParam);
        const registrationStatus = await RegistrationService.verifyEmail({token: tokenParam});
        setRegistrationStatus(registrationStatus);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const initiateApprovals = async () => {
    setIsWorking(true);
    try {
      if (token) {
        const res = await RegistrationService.initiateApprovals({token});
        setRegistrationStatus(res);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  useEffect(() => {
    loadRegistration().then();
  }, []); //eslint-disable-line

  return (
    <>
      <h3>Initiate Approvals</h3>
      {registrationStatus ?
        <RegistrationDetail registration={registrationStatus.registration}/> :
        <p>Loading...</p>
      }
      {registrationStatus?.registration.status === ApprovalStatus.PENDING_APPROVAL ?
        <p>Approvals will now be sought from the other network participants</p> : null}
      {registrationStatus?.registration.status === ApprovalStatus.APPROVED ?
        <p>Registration is approved</p> : null}
      {registrationStatus?.registration.status === ApprovalStatus.REJECTED ?
        <p>Registration is rejected</p> : null}

      <ErrorMessage>{error}</ErrorMessage>
      {registrationStatus?.registration.status === ApprovalStatus.PENDING_INITIATION ?
        <ButtonPanel>
          <BigButton
            disabled={!registrationStatus || isWorking || registrationStatus.registration.status !== ApprovalStatus.PENDING_INITIATION}
            onClick={initiateApprovals}>
            Confirm
          </BigButton>
        </ButtonPanel> : null}
    </>
  );
};
