import styled from 'styled-components';
import { ReactNode } from 'react';
import ErrorMessage from './components/error-message';

const MyWrapper = styled.div`
  padding: 20px;
  max-width: 800px;
`;

type Props = {
  children: ReactNode
}

const Wrapper = ({ children }: Props) => {
  return (
    <MyWrapper>
      {children}
      <ErrorMessage />
    </MyWrapper>
  );
};

export default Wrapper;
