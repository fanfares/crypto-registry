import { Bip84Utils } from './bip84-utils';

export const isValidZpub = (zpub: string): boolean => {
  try {
    new Bip84Utils(zpub);
    return true;
  } catch (err) {
    return false;
  }
};
