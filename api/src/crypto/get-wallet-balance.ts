import bip84 from 'bip84';
import { BitcoinService } from './bitcoin.service';
import { wait } from '../utils/wait';
import { Logger } from '@nestjs/common';

export const getWalletBalance = async (
  zpub: string,
  bitcoinService: BitcoinService,
  logger: Logger,
  waitMilliseconds?: number
): Promise<number> => {
  const account = new bip84.fromZPub(zpub);
  const MAX_EMPTY_ADDRESSES = 40;

  let walletBalance = 0;
  let addressesWithZeroBalance = 0;
  for (let i = 0; addressesWithZeroBalance < MAX_EMPTY_ADDRESSES; i++) {
    const address = account.getAddress(i);
    if (waitMilliseconds) {
      await wait(waitMilliseconds);
    }
    const addressBalance = await bitcoinService.getAddressBalance(address);
    if (addressBalance > 0) {
      walletBalance += addressBalance;
      addressesWithZeroBalance = 0;
    } else {
      addressesWithZeroBalance++;
    }

    const changeAddress = account.getAddress(i, true);
    if (waitMilliseconds) {
      await wait(waitMilliseconds);
    }
    const changeAddressBalance = await bitcoinService.getAddressBalance(changeAddress);
    if (changeAddressBalance > 0) {
      walletBalance += changeAddressBalance;
      addressesWithZeroBalance = 0;
    } else {
      addressesWithZeroBalance++;
    }
  }

  return walletBalance;
};
