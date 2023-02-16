import { BitcoinService } from './bitcoin.service';
import { DbService } from '../db/db.service';
import { WalletAddress } from '../types/wallet-address-db.types';
import { ApiConfigService } from '../api-config';
import { Network } from '@bcr/types';
import { Bip84Account } from './bip84-account';

export const resetRegistryWalletHistory = async (
  bitcoinService: BitcoinService,
  dbService: DbService,
  apiConfigService: ApiConfigService,
  network: Network
) => {

  let addressTxCount: number;
  const zpub = apiConfigService.getRegistryZpub(network);
  const account = new Bip84Account(zpub);
  const usedAddresses: WalletAddress [] = [];

  async function checkAddressForExistingPayment(addressIndex: number) {
    const address: string = account.getAddress(addressIndex);
    const txs = await bitcoinService.getTransactionsForAddress(address);
    addressTxCount = txs.length;

    if (addressTxCount > 0) {
      usedAddresses.push({
        zpub: zpub,
        address: address,
        index: addressIndex
      });
    }
  }

  let addressIndex = 0;
  let zeroTxAddresses = 0;
  await checkAddressForExistingPayment(addressIndex);
  while (addressTxCount > 0) {
    addressIndex++;
    await checkAddressForExistingPayment(addressIndex);
  }

  if (usedAddresses.length > 0) {
    await dbService.walletAddresses.insertMany(usedAddresses);
  }
};
