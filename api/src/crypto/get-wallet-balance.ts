import { BitcoinService } from './bitcoin.service';
import { wait } from '../utils/wait';
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
    const log = i % 10 === 0;
    const address = account.getAddress(i, change);

    if (log) {
      bitcoinService.logger.debug('Checking balance address ' + i, {
        zpub: account.zpub.toString()
      });
    }

    if (waitMilliseconds) {
      bitcoinService.logger.debug('Waiting ' + waitMilliseconds + 'ms');
      await wait(waitMilliseconds);
    }

    const addressBalance = await bitcoinService.getAddressBalance(address);
    balance += addressBalance;

    const hasTx = await bitcoinService.addressHasTransactions(address);

    if (hasTx) {
      zeroTxAddresses = 0;
    } else {
      zeroTxAddresses++;
    }

    if (log) {
      bitcoinService.logger.debug('Retrieved balance address ' + i, {
        zpub: account.zpub.toString(),
        addressBalance: addressBalance,
        totalBalance: balance,
        addressHasTransactions: hasTx,
        zeroTxAddresses: zeroTxAddresses
      });
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
