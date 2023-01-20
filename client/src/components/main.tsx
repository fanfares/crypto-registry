import React, { ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useStore } from '../store';
import Button from 'react-bootstrap/Button';
import { Network } from '../open-api';

const CentreLayoutContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: auto;
`;

export interface Props {
  children: ReactNode;
}

export const Main = ({ children }: Props) => {
  const nav = useNavigate();
  const { init, docsUrl, setNetwork, network } = useStore();

  useEffect(() => {
    init();
  }, []); // eslint-disable-line

  const toggleNetwork = () => {
    setNetwork(network === Network.MAINNET ? Network.TESTNET : Network.MAINNET);
  };

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand onClick={() => nav('/')} href="/">Crypto Registry</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => nav('submit-file')}>Submit</Nav.Link>
              <Nav.Link onClick={() => nav('check-submission')}>Check</Nav.Link>
              <Nav.Link onClick={() => nav('verify')}>Verify</Nav.Link>
              <Nav.Link onClick={() => nav('sha-256')}>SHA256</Nav.Link>
              <Nav.Link onClick={() => nav('network')}>Network</Nav.Link>
              <Nav.Link onClick={() => nav('request-key')}>Request Key</Nav.Link>
              <Nav.Link href={docsUrl}>API</Nav.Link>
            </Nav>
            <Button onClick={toggleNetwork} variant="outline-light">{network}</Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <CentreLayoutContainer>
        {children}
      </CentreLayoutContainer>
    </div>
  );
};
