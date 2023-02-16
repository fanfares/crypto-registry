import { Bip84Account } from './bip84-account';

export const generateAddress = (
  zpub: string,
  index: number,
  forChange: boolean
): string => {
  const account = new Bip84Account(zpub);
  return account.getAddress(index, forChange);
};
