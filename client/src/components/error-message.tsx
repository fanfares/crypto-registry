import { useStore } from '../store';

import styles from './error-message.module.css';

const ErrorMessage = () => {
  const { errorMessage } = useStore();

  if (!errorMessage) return null;

  return (
    <div className={styles.error}>{errorMessage}</div>
  );
};

export default ErrorMessage;
