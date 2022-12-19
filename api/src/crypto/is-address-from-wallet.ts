import bip84 from 'bip84';

export const isAddressFromWallet = (
  address: string,
  zpub: string
): boolean => {
  const account = new bip84.fromZPub(zpub);

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
