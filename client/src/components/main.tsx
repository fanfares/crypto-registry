import React, { ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useStore } from '../store';

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
  const { init, docsUrl } = useStore()

  useEffect(() => {
    init()
  }, [])

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand onClick={() => nav('/')}  href="/">Crypto Registry</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => nav('submit-file')}>Submit</Nav.Link>
              <Nav.Link onClick={() => nav('check-submission')}>Check</Nav.Link>
              <Nav.Link onClick={()=> nav('verify')}>Verify</Nav.Link>
              <Nav.Link href={docsUrl}>API</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <CentreLayoutContainer>
        {children}
      </CentreLayoutContainer>
    </div>
  );
};
