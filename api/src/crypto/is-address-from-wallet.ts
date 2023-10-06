import { Bip84Utils } from './bip84-utils';

export const isAddressFromWallet = (
  address: string,
  zpub: string
): boolean => {
  const bip84Utils = Bip84Utils.fromExtendedKey(zpub);
  // todo - this 1000 should be a parameter.  Maybe a million would be better?
  for (let i = 0; i < 1000; i++) {
    const testAddress = bip84Utils.getAddress(i, false);
    if (address === testAddress) {
      return true;
    }
    const testChangeAddress = bip84Utils.getAddress(i, true);
    if (address === testChangeAddress) {
      return true;
    }
  }
  return false;
};
