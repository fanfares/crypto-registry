import { BitcoinService } from './bitcoin.service';
import { wait } from "../utils";
import { Bip84Account } from './bip84-account';

export const getAddressSeriesBalance = async (
  account: Bip84Account,
  bitcoinService: BitcoinService,
  change: boolean,
  waitMilliseconds?: number
) => {
  let balance = 0;
  let zeroTxAddresses = 0;
  const maxEmpty = change ? 10 : 20;
  for (let i = 0; zeroTxAddresses < maxEmpty; i++) {
    const address = account.getAddress(i, change);

    if (waitMilliseconds) {
      bitcoinService.logger.log('Waiting ' + waitMilliseconds + 'ms');
      await wait(waitMilliseconds);
    }

    const addressBalance = await bitcoinService.getAddressBalance(address);
    bitcoinService.logger.log('Next Address', { i, change, address, addressBalance, zeroTxAddresses, balance})
    balance += addressBalance;
    const hasTx = await bitcoinService.addressHasTransactions(address);

    if (hasTx) {
      zeroTxAddresses = 0;
    } else {
      zeroTxAddresses++;
    }
  }
  return balance;
};

export const getWalletBalance = async (
  zpub: string,
  bitcoinService: BitcoinService,
  waitMilliseconds?: number,
): Promise<number> => {
  const account: Bip84Account = new Bip84Account(zpub);
  const receivedBalance = await getAddressSeriesBalance(account, bitcoinService, false, waitMilliseconds);
  const changeBalance = await getAddressSeriesBalance(account, bitcoinService, true, waitMilliseconds);
  return receivedBalance + changeBalance;
};
