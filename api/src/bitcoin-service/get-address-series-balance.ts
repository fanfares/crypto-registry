import { Bip84Utils } from '../crypto';
import { BitcoinService } from './bitcoin.service';

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
