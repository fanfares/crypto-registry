import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ApprovalStatus, ApprovalStatusDto, RegistrationService } from '../../open-api';
import Error from '../utils/error';
import ButtonPanel from '../utils/button-panel';
import BigButton from '../utils/big-button';
import { RegistrationDetail } from './registration-detail';
import { ApiError } from '../../open-api/core/ApiError.ts';
import { getErrorMessage } from '../../utils';

export const ApproveRegistration = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string>();
  const [isWorking, setIsWorking] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatusDto>();

  const approveRegistration = async (approved: boolean) => {
    try {
      setIsWorking(true);
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        const res = await RegistrationService.approve({
          token: tokenParam,
          approved: approved
        });
        setApprovalStatus(res);
      }
    } catch (err) {
      if ( err instanceof ApiError ) {
        setError(err.message);
      }
    }
    setIsWorking(false);
  };

  const getApprovalStatus = async () => {
    try {
      const tokenParam = searchParams.get('token');
      if (tokenParam) {
        const status = await RegistrationService.getApprovalStatus(tokenParam);
        setApprovalStatus(status);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setIsWorking(false);
  };

  useEffect(() => {
    getApprovalStatus();
  }, []); // eslint-disable-line

  if (!approvalStatus) {
    return (
      <>
        <h3>Registration Request</h3>
        <p>Loading...</p>
      </>
    );
  }

  const renderApprovalButtons = () => {
    return (
      <div>
        <p>Your approval is sought for this node to join the network.</p>
        <Error>{error}</Error>
        <ButtonPanel>
          <BigButton
            style={{marginRight: 10}}
            disabled={isWorking || error}
            onClick={() => approveRegistration(true)}>
            Approve
          </BigButton>
          <BigButton
            style={{marginLeft: 10}}
            disabled={isWorking}
            onClick={() => approveRegistration(false)}>
            Reject
          </BigButton>
        </ButtonPanel>
      </div>
    );
  };

  const renderApprovalStatus = () => {
    switch (approvalStatus.status) {
      case ApprovalStatus.APPROVED:
        return <p>Request is approved.</p>;
      case ApprovalStatus.PENDING_APPROVAL:
        return renderApprovalButtons();
      case ApprovalStatus.REJECTED:
        return <p>Request has already been rejected</p>;
      case ApprovalStatus.PENDING_INITIATION:
        return <p>Request is pending approval initiation</p>;
    }
  };

  return (
    <>
      <h3>Registration Request</h3>
      <RegistrationDetail registration={approvalStatus.registration}/>
      {renderApprovalStatus()}
    </>
  );
};
