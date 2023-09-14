import { BitcoinService } from './bitcoin.service';

export const getAddressSeriesBalance = async (
  bitcoinService: BitcoinService,
  zpub: string,
  change: boolean
) => {
  let balance = 0;
  let zeroTxAddresses = 0;
  const maxEmpty = change ? 10 : 20;
  for (let i = 0; zeroTxAddresses < maxEmpty; i++) {
    const address = bitcoinService.getAddress(zpub, i, change);
    const addressBalance = await bitcoinService.getAddressBalance(address);
    bitcoinService.logger.log('Next Address', {i, change, address, addressBalance, zeroTxAddresses, balance})
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
  const receivedBalance = await getAddressSeriesBalance(bitcoinService, zpub, false);
  const changeBalance = await getAddressSeriesBalance(bitcoinService, zpub, true);
  return receivedBalance + changeBalance;
};
