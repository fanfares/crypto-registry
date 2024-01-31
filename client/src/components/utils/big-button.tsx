import { Button, ButtonProps } from 'antd';
import { FC } from 'react';

const BigButton: FC<ButtonProps> = (
  props: ButtonProps
) => {
  return <Button
    type="primary"
    style={{
      minWidth: '160px',
      height: '50px',
      margin: '0 5px 0 5px'
    }}  {...props}/>;
};

export default BigButton;
