import { DbService } from '../db/db.service';
import { WalletAddress } from '../types/wallet-address-db.types';
import { ApiConfigService } from '../api-config';
import { Network } from '@bcr/types';
import { Bip84Account } from './bip84-account';
import { BitcoinServiceFactory } from './bitcoin-service-factory';

export const resetRegistryWalletHistory = async (
  dbService: DbService,
  apiConfigService: ApiConfigService,
  bitcoinServiceFactory: BitcoinServiceFactory,
  network: Network
) => {
  const bitcoinService = bitcoinServiceFactory.getService(network);

  if (!bitcoinService) {
    return;
  }

  await dbService.walletAddresses.deleteMany({ network: { $exists: false } });
  await dbService.walletAddresses.deleteMany({ network });
  const zpub = apiConfigService.getRegistryZpub(network);
  const account = new Bip84Account(zpub);

  let zeroTxAddresses = 0;
  let addressIndex = 0;
  while (zeroTxAddresses < 20) {
    const address = account.getAddress(addressIndex);
    const txs = await bitcoinService.getTransactionsForAddress(address);
    if (txs.length === 0) {
      zeroTxAddresses++;
    } else {
      zeroTxAddresses = 0;
    }
    addressIndex++;
  }

  const usedAddresses: WalletAddress [] = [];
  for (let index = 0; index < Math.max(0, addressIndex - 20); index++) {
    const address = account.getAddress(index);
    usedAddresses.push({
      zpub: zpub,
      address: address,
      network: network
    });
  }

  if (usedAddresses.length > 0) {
    await dbService.walletAddresses.insertMany(usedAddresses);
  }
};
