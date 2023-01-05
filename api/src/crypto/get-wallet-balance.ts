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

  let walletBalance = 0;
  for (let i = 0; i < 17; i++) {
    const address = account.getAddress(i);
    if (wait) {
      await wait(waitMilliseconds);
    }
    const addressBalance = await bitcoinService.getAddressBalance(address);
    if (addressBalance > 0) {
      walletBalance += addressBalance;
    }

    const changeAddress = account.getAddress(i, true);
    if (wait) {
      await wait(waitMilliseconds);
    }
    const changeAddressBalance = await bitcoinService.getAddressBalance(changeAddress);
    if (changeAddressBalance > 0) {
      walletBalance += changeAddressBalance;
    }
  }

  return walletBalance;
};
