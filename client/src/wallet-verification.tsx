import React from 'react';
import { WalletVerificationDto } from './open-api';
import styled from 'styled-components';
import { Container, Row, Col } from 'react-bootstrap';

const NarrowContainer = styled(Container)`
  max-width: 400px;
  float: left;
`;


const WalletVerification = ({walletVerificationDto}: {
  walletVerificationDto: WalletVerificationDto
}) => {

  return (
    <NarrowContainer>
      <Row>
        <Col>
          Custodian
        </Col>
        <Col>
          {walletVerificationDto.custodianName}
        </Col>
      </Row>
      <Row>
        <Col>
          BlockChain Balance
        </Col>
        <Col>
          {walletVerificationDto.blockChainBalance}
        </Col>
      </Row>
      <Row>
        <Col>
          Customer Holdings
        </Col>
        <Col>
          {walletVerificationDto.totalCustomerHoldings}
        </Col>
      </Row>
      <Row>
        <Col>
          Status
        </Col>
        <Col>
          {walletVerificationDto.status}
        </Col>
      </Row>
      <Row>
        <Col>
          Your Balance
        </Col>
        <Col>
          {walletVerificationDto.customerBalance}
        </Col>
      </Row>
    </NarrowContainer>
  );
};

export default WalletVerification;
