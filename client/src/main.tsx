import { ReactNode } from 'react';
import styled from 'styled-components';

const CentreLayoutContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: auto;
`;

const Box = styled.div`
  border: #0a53be solid 1px;
  //width: 100px;
  height: 100px;
  //flex-grow: 1;
  //max-width: 700px;

`;

export interface Props {
  children: ReactNode;
}

export const Main = ({children}: Props) => {
  return (
    <div>
      <nav className="navbar navbar-light pb-1 pb-sm-3 mb-2 mb-sm-4 border-bottom">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <span className="fs-4">Bitcoin Custodian Registry</span>
          </a>
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
