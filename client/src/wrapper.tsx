import styled from 'styled-components';

const MyWrapper = styled.div`
  padding: 20px;
`

type Props = {
  children: JSX.Element
}

const Wrapper = ({children}: Props) => {
  return (
    <MyWrapper>
      {children}
    </MyWrapper>
  );
};

export default Wrapper;
