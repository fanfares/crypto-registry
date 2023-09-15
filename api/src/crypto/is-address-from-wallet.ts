import { BitcoinService } from "./bitcoin.service";

export const isAddressFromWallet = (
  bitcoinService: BitcoinService,
  address: string,
  zpub: string
): boolean => {
  const addressGenerator = bitcoinService.getAddressGenerator(zpub)
  // todo - this 1000 should be a parameter.  Maybe a million would be better?
  for (let i = 0; i < 1000; i++) {
    const testAddress = addressGenerator.getAddress(i, false);
    if (address === testAddress) {
      return true;
    }
    const testChangeAddress = addressGenerator.getAddress(i, true);
    if (address === testChangeAddress) {
      return true;
    }
  }
  return false;
};
