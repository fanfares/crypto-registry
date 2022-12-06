import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Navbar, Container } from 'react-bootstrap';

const CentreLayoutContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: auto;
`;

export interface Props {
  children: ReactNode;
}

export const Main = ({ children }: Props) => {
  return (
    <div>

      <nav className="navbar navbar-light pb-1 pb-sm-3 mb-2 mb-sm-4 border-bottom">
        <div className="container-fluid">
          <div className="navbar-brand">
            <a href="/" className="fs-4">Crypto Registry</a>
          </div>
          <div className="navbar-expand" id="navbarNav">
            <ul className="navbar-nav">
            </ul>
          </div>
        </div>
      </nav>


      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand className="fs-4" href="/">Crypto Registry</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
          </Navbar.Collapse>
         </Container>
      </Navbar>

      <CentreLayoutContainer>
        {children}
      </CentreLayoutContainer>
    </div>
  );
};
