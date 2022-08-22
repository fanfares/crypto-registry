import { useState, useEffect } from 'react';

export const getStorageValue = (key: string, defaultValue: string) => {
  const saved = localStorage.getItem(key);
  return saved || defaultValue
};

export const useLocalStorage = (key: string, defaultValue: string) => {
  const [value, setValue] = useState(() => {
    return getStorageValue(key, defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue];
};
