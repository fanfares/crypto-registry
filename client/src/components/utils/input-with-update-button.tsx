import styles from './input-with-copy-button.module.css';
import { useState } from 'react';
import { InputGroup, FloatingLabel } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export interface InputWithUpdateButtonProps {
  text: string;
  label: string;
  subtext?: string;
  updateFn: () => Promise<void>
}

const InputWithUpdateButton = ({ text, label, subtext, updateFn }: InputWithUpdateButtonProps) => {
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const update = async () => {
    setIsWorking(true);
    await updateFn()
    setIsWorking(false);
  };

  const style = isWorking ? `${styles.text} ${styles.isWorking}` : styles.text;

  return (
    <div style={{ marginTop: '20px', width: '600px' }}>
      <InputGroup className={style}>
        <FloatingLabel
          label={label}>
          <Form.Control
            value={text} />
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
