import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { useStore } from '../store';

export interface Props {
  children: ReactNode;
}

export const Main = ({ children }: Props) => {
  const nav = useNavigate();
  const {
    init, docsUrl, isAuthenticated, signOut, isAdmin
  } = useStore();

  useEffect(() => {
    init();
  }, []); // eslint-disable-line

  const signOutAndGoToSignIn = () => {
    signOut();
    nav('/sign-in');
  };

  function renderAuthenticatedNavLinks() {
    const adminLinks = isAdmin ? <Nav.Link onClick={() => nav('admin')}>Admin</Nav.Link> : null;

    return (
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link onClick={() => nav('funding')}>Funding</Nav.Link>
          <Nav.Link onClick={() => nav('holdings')}>Holdings</Nav.Link>
          <Nav.Link onClick={() => nav('verify')}>Verify</Nav.Link>
          <Nav.Link onClick={() => nav('sha-256')}>SHA256</Nav.Link>
          {adminLinks}
          <Nav.Link href={docsUrl}>API</Nav.Link>
        </Nav>
        <Nav className="justify-content-end" activeKey="/home">
          <Nav.Link onClick={signOutAndGoToSignIn}>Sign Out</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    );
  }

  function renderNotAuthenticatedNavLinks() {
    return (
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link onClick={() => nav('verify')}>Verify</Nav.Link>
        </Nav>
        <Nav className="justify-content-end" activeKey="/home">
          <Nav.Link onClick={() => nav('sign-in')}>Sign In</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    );
  }

  return (
    <div>
      <Navbar bg="primary" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand onClick={() => nav('/')} href="/">Home</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          {isAuthenticated ? renderAuthenticatedNavLinks() : renderNotAuthenticatedNavLinks()}
        </Container>
      </Navbar>

      <Container>
        {children}
      </Container>
    </div>
  );
};
