import { BitcoinService } from './bitcoin.service';
import { Bip84Utils } from './bip84-utils';

export const getAddressSeriesBalance = async (
  bitcoinService: BitcoinService,
  bip84Utils:  Bip84Utils,
  change: boolean
) => {
  let balance = 0;
  let zeroTxAddresses = 0;
  const maxEmpty = change ? 10 : 20;
  for (let i = 0; zeroTxAddresses < maxEmpty; i++) {
    const address = bip84Utils.getAddress(i, change);
    const addressBalance = await bitcoinService.getAddressBalance(address);
    // bitcoinService.logger.log('Next Address', {i, change, address, addressBalance, zeroTxAddresses, balance})
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
  bitcoinService: BitcoinService
): Promise<number> => {
  const account = Bip84Utils.fromExtendedKey(zpub);
  const receivedBalance = await getAddressSeriesBalance(bitcoinService, account, false);
  const changeBalance = await getAddressSeriesBalance(bitcoinService, account, true);
  return receivedBalance + changeBalance;
};
