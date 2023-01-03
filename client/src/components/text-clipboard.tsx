import styles from './text-clipboard.module.css';
import * as Icon from 'react-bootstrap-icons';
import React, { useState } from 'react';

export interface TextClipboardProps {
  text: string;
}

const TextClipboard = ({ text }: TextClipboardProps) => {
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
    <span onClick={copy} className={style}>
      <span style={{ marginLeft: '5px' }}>{text}</span>
      <span className={styles.icon}>
        <Icon.ClipboardCheck />
      </span>
    </span>
  );
};

export default TextClipboard;
