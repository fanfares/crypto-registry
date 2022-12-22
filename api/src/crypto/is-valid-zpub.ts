import bip84 from 'bip84';

export const isValidZpub = (zpub: string): boolean => {
  try {
    new bip84.fromZPub(zpub);
    return true;
  } catch (err) {
    return false;
  }
};
