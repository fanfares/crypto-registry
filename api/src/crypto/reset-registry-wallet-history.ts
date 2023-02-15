import { BitcoinService } from './bitcoin.service';
import bip84 from 'bip84';
import { DbService } from '../db/db.service';
import { WalletAddress } from '../types/wallet-address-db.types';
import { ApiConfigService } from '../api-config';
import { Network } from '@bcr/types';

export const resetRegistryWalletHistory = async (
  bitcoinService: BitcoinService,
  dbService: DbService,
  apiConfigService: ApiConfigService,
  network: Network
) => {

  let addressTxCount: number;
  const account = new bip84.fromZPub(apiConfigService.getRegistryZpub(network));
  const usedAddresses: WalletAddress [] = [];

  async function checkAddressForExistingPayment(addressIndex: number) {
    const address: string = account.getAddress(addressIndex);
    const txs = await bitcoinService.getTransactionsForAddress(address);
    addressTxCount = txs.length;

    if (addressTxCount > 0) {
      usedAddresses.push({
        zpub: 'unknown',
        address: address,
        index: addressIndex
      });
    }
  }

  let addressIndex = 0;
  await checkAddressForExistingPayment(addressIndex);
  while (addressTxCount > 0) {
    await checkAddressForExistingPayment(addressIndex);
    addressIndex++;
  }

  if (usedAddresses.length > 0) {
    await dbService.walletAddresses.insertMany(usedAddresses);
  }
};
