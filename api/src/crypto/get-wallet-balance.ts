import bip84 from 'bip84';
import { BitcoinService } from './bitcoin.service';
import { wait } from '../utils/wait';
import { Logger } from '@nestjs/common';

interface HdWallet {
  getAddress(index: number, change: boolean)
}

export const getAddressSeriesBalance = async (
  account: HdWallet,
  bitcoinService: BitcoinService,
  change: boolean,
  waitMilliseconds?: number,
) => {
  let balance = 0;
  let addressesWithZeroBalance = 0;
  const maxEmpty = change ? 10 : 20
  for (let i = 0; addressesWithZeroBalance < maxEmpty; i++) {
    const address = account.getAddress(i, change);
    if (waitMilliseconds) {
      await wait(waitMilliseconds);
    }
    const addressBalance = await bitcoinService.getAddressBalance(address);
    if (addressBalance > 0) {
      balance += addressBalance;
      addressesWithZeroBalance = 0;
    } else {
      addressesWithZeroBalance++;
    }
  }
  return balance
}

export const getWalletBalance = async (
  zpub: string,
  bitcoinService: BitcoinService,
  waitMilliseconds?: number
): Promise<number> => {
  const account: HdWallet = new bip84.fromZPub(zpub);
  const receivedBalance = await getAddressSeriesBalance(account, bitcoinService, false, waitMilliseconds)
  const changeBalance = await getAddressSeriesBalance(account, bitcoinService, true, waitMilliseconds)
  return receivedBalance + changeBalance;
};
