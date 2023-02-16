import { Bip84Account } from './bip84-account';

export const isValidZpub = (zpub: string): boolean => {
  try {
    new Bip84Account(zpub);
    return true;
  } catch (err) {
    return false;
  }
};
