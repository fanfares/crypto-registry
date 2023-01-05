import bip84 from 'bip84';

export const generateAddress = (
  zpub: string,
  index: number,
  forChange: boolean
): string => {
  const account = new bip84.fromZPub(zpub);
  return account.getAddress(index, forChange);
};
