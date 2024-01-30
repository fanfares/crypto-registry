import { BitcoinService } from './bitcoin.service';
import { Bip84Utils } from '../crypto';
import { AddressDto, AddressType } from '@bcr/types';

export const getAddressesForType = async (
  extendedKey:  string,
  type: AddressType,
  bitcoinService: BitcoinService
): Promise<AddressDto[]> => {
  const account = Bip84Utils.fromExtendedKey(extendedKey);
  let zeroTxAddresses = 0;
  const ret: AddressDto[] = [];
  const maxEmpty = type === AddressType.CHANGE ? 10 : 20;
  for (let i = 0; zeroTxAddresses < maxEmpty; i++) {
    const address = account.getAddress(i, type === AddressType.CHANGE);
    const addressBalance = await bitcoinService.getAddressBalance(address);
    ret.push({
      address: address,
      type: type,
      balance: addressBalance,
      index: i
    })
    const hasTx = await bitcoinService.addressHasTransactions(address);
    if (hasTx) {
      zeroTxAddresses = 0;
    } else {
      zeroTxAddresses++;
    }

  }
  return ret;
};

export const getWalletAddressesDto = async (
  extendedKey: string,
  bitcoinService: BitcoinService
): Promise<AddressDto[]> => {
  let addresses =await getAddressesForType(extendedKey, AddressType.RECEIVE, bitcoinService);
  addresses = addresses.concat(await getAddressesForType(extendedKey, AddressType.CHANGE, bitcoinService));
  return addresses;
};
