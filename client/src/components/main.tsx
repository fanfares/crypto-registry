import { ReactNode } from 'react';
import styled from 'styled-components';

const CentreLayoutContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: auto;
`;

export interface Props {
  children: ReactNode;
}

export const Main = ({children}: Props) => {
  return (
    <div>
      <nav className="navbar navbar-light pb-1 pb-sm-3 mb-2 mb-sm-4 border-bottom">
        <div className="container-fluid">
          <div className="navbar-brand">
            <span className="fs-4">Crypto Registry</span>
          </div>
          <div className="navbar-expand" id="navbarNav">
            <ul className="navbar-nav">
            </ul>
          </div>
        </div>
      </nav>

      <CentreLayoutContainer>
        {children}
      </CentreLayoutContainer>
    </div>
  );
};
