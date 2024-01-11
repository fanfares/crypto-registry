import styled from 'styled-components';
import Button, { ButtonProps } from 'react-bootstrap/Button';
import { FC } from 'react';

const ButtonButton: FC<ButtonProps> = styled(Button)`
  width: 130px;
  height: 50px;
  margin: 0 5px 0 5px;  
`;

export default ButtonButton;
