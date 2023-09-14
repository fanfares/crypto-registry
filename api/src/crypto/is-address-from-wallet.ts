import { BitcoinService } from "./bitcoin.service";

export const isAddressFromWallet = (
  bitcoinService: BitcoinService,
  address: string,
  zpub: string
): boolean => {
  // todo - this 1000 should be a parameter.  Maybe a million would be better?
  for (let i = 0; i < 1000; i++) {
    const testAddress = bitcoinService.getAddress(zpub, i, false);
    if (address === testAddress) {
      return true;
    }
    const testChangeAddress = bitcoinService.getAddress(zpub, i, true);
    if (address === testChangeAddress) {
      return true;
    }
  }
  return false;
};
