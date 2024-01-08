import styles from './input-with-copy-button.module.css';
import React, { useState } from 'react';
import { InputGroup, FloatingLabel } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export interface InputWithCopyButtonProps {
  text: string;
  label: string;
  subtext?: string;
}

const InputWithCopyButton = ({ text, label, subtext }: InputWithCopyButtonProps) => {
  const [isWorking, setIsWorking] = useState<boolean>(false);

  const copy = async () => {
    if (text) {
      setIsWorking(true);
      await navigator.clipboard.writeText(text);
      setTimeout(() => {
        setIsWorking(false);
      }, 300);
    }
  };

  const style = isWorking ? `${styles.text} ${styles.isWorking}` : styles.text;

  return (
    <div style={{ marginTop: '20px', width: '600px' }}>
      <InputGroup className={style}>
        <FloatingLabel
          label={label}>
          <Form.Control
            disabled={true}
            value={text} />
        </FloatingLabel>
        <Button variant="outline-secondary"
                onClick={copy}>
          Copy
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

export default InputWithCopyButton;
