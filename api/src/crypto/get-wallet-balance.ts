import { BitcoinService } from './bitcoin.service';
import { AddressGenerator } from './bip84-utils';

export const getAddressSeriesBalance = async (
  bitcoinService: BitcoinService,
  addressGenerator: AddressGenerator,
  change: boolean
) => {
  let balance = 0;
  let zeroTxAddresses = 0;
  const maxEmpty = change ? 10 : 20;
  for (let i = 0; zeroTxAddresses < maxEmpty; i++) {
    const address = addressGenerator.getAddress(i, change);
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
  const account = bitcoinService.getAddressGenerator(zpub);
  const receivedBalance = await getAddressSeriesBalance(bitcoinService, account, false);
  const changeBalance = await getAddressSeriesBalance(bitcoinService, account, true);
  return receivedBalance + changeBalance;
};
