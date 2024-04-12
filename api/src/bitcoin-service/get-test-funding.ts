import { BitcoinService } from './bitcoin.service';
import { Bip84Utils, SignedAddress } from '../crypto';

export const getTestFunding = async (
  extendedPublicKey: string,
  bitcoinService: BitcoinService,
  numberOfAddresses: number,
): Promise<SignedAddress[]> => {
  const account = Bip84Utils.fromExtendedKey(extendedPublicKey);
  const message = await bitcoinService.getLatestBlock();

  const ret: SignedAddress[] = [];
  for (let i = 0; i < numberOfAddresses; i++) {
    const address = account.getAddress(i, false);
    ret.push({
      address,
      message: message,
      signature: account.sign(i, false, message).signature
    });
  }
  return ret;
};

