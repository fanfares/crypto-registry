import styles from './input-with-copy-button.module.css';
import { useState } from 'react';
import { FloatingLabel, InputGroup } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { UseFormRegisterReturn } from 'react-hook-form';

export interface InputWithUpdateButtonProps {
  label: string;
  subtext?: string;
  updateFn: () => Promise<void>;
  register: UseFormRegisterReturn;
}

const InputWithUpdateButton = ({label, subtext, updateFn, register}: InputWithUpdateButtonProps) => {
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const update = async () => {
    setIsWorking(true);
    await updateFn();
    setIsWorking(false);
  };

  const style = isWorking ? `${styles.text} ${styles.isWorking}` : styles.text;

  return (
    <div style={{marginTop: '20px', width: '1000px'}}>
      <InputGroup className={style}>
        <FloatingLabel
          label={label}>
          <Form.Control {...register}/>
        </FloatingLabel>
        <Button variant="outline-secondary"
                onClick={update}>
          Update
        </Button>
      </InputGroup>
      {subtext ?
        <Form.Text className="text-muted">
          {subtext}
        </Form.Text>
        : null}
    </div>
  );
};

export default InputWithUpdateButton;
