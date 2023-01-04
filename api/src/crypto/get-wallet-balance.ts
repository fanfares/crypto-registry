import bip84 from 'bip84';
import { BitcoinService } from './bitcoin.service';
import { Network } from '@bcr/types';

export const getWalletBalance = async (
  zpub: string,
  network: Network,
  bitcoinService: BitcoinService
): Promise<number> => {
  const account = new bip84.fromZPub(zpub);

  let walletBalance = 0;
  for (let i = 0; i < 17; i++) {
    const address = account.getAddress(i);
    const addressBalance = await bitcoinService.getAddressBalance(address, network);
    if (addressBalance > 0) {
      walletBalance += addressBalance;
    }

    const changeAddress = account.getAddress(i, true);
    const changeAddressBalance = await bitcoinService.getAddressBalance(changeAddress, network);
    if (changeAddressBalance > 0) {
      walletBalance += changeAddressBalance;
    }
  }

  return walletBalance;
};
