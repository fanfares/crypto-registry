import styled from 'styled-components';
import { ReactNode } from 'react';

const MyWrapper = styled.div`
  padding: 20px;
  max-width:800px;
`;

type Props = {
  children: ReactNode
}

const Wrapper = ({children}: Props) => {
  return (
    <MyWrapper>
      {children}
    </MyWrapper>
  );
};

export default Wrapper;
