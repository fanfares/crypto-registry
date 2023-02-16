import bip84 from 'bip84';

export const isAddressFromWallet = (
  address: string,
  zpub: string
): boolean => {
  const account = new bip84.fromZPub(zpub);

  // todo - this 1000 should be a parameter.  Maybe a million would be better?
  for (let i = 0; i < 1000; i++) {
    const testAddress = account.getAddress(i, false);
    if (address === testAddress) {
      return true;
    }
    const testChangeAddress = account.getAddress(i, true);
    if (address === testChangeAddress) {
      return true;
    }
  }
  return false;
};
