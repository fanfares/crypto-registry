import bip84 from 'bip84';
import { BitcoinService } from './bitcoin.service';
import { wait } from '../utils/wait';
import { Logger } from '@nestjs/common';
import { Network } from '@bcr/types';

export const getWalletBalance = async (
  zpub: string,
  bitcoinService: BitcoinService,
  logger: Logger,
  network: Network
): Promise<number> => {
  const account = new bip84.fromZPub(zpub);

  let walletBalance = 0;
  for (let i = 0; i < 17; i++) {
    const address = account.getAddress(i);
    if (network === Network.mainnet) {
      await wait(2000);
    }
    logger.debug('get address balance', { address, index: i });
    const addressBalance = await bitcoinService.getAddressBalance(address);
    if (addressBalance > 0) {
      walletBalance += addressBalance;
    }

    logger.debug('get change address balance', { address, index: i });
    const changeAddress = account.getAddress(i, true);
    if (network === Network.mainnet) {
      await wait(2000);
    }
    const changeAddressBalance = await bitcoinService.getAddressBalance(changeAddress);
    if (changeAddressBalance > 0) {
      walletBalance += changeAddressBalance;
    }
  }

  return walletBalance;
};
