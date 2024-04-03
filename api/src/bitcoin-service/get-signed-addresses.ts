import { BitcoinService } from './bitcoin.service';
import { Bip84Utils, SignedAddress } from '../crypto';

const getSignedAddressesSeries = async (
  bitcoinService: BitcoinService,
  account: Bip84Utils,
  message: string,
  change: boolean
): Promise<SignedAddress[]> => {
  const ret: SignedAddress[] = [];
  let zeroTxAddresses = 0;
  const maxEmpty = change ? 10 : 20;
  for (let i = 0; zeroTxAddresses < maxEmpty; i++) {
    const address = account.getAddress(i, change);
    const addressBalance = await bitcoinService.getAddressBalance(address);

    if (addressBalance) {
      ret.push({
        address,
        message: message,
        signature: account.sign(i, change, message).signature
      });
    }

    const hasTx = await bitcoinService.addressHasTransactions(address);

    if (hasTx) {
      zeroTxAddresses = 0;
    } else {
      zeroTxAddresses++;
    }
  }
  return ret;
};

export const getSignedAddresses = async (
  zpub: string,
  message: string,
  bitcoinService: BitcoinService
): Promise<SignedAddress[]> => {
  const account = Bip84Utils.fromExtendedKey(zpub);
  const received = await getSignedAddressesSeries(bitcoinService, account, message, false);
  const change = await getSignedAddressesSeries(bitcoinService, account, message, true);
  return received.concat(change);
};
