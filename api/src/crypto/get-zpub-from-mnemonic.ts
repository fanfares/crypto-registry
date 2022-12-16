import bip84 from 'bip84';
import { Network } from '@bcr/types';

export const getZpubFromMnemonic = (
  mnemonic: string,
  password: string,
  network: Network
) => {
  const root = new bip84.fromMnemonic(mnemonic, password, network === 'testnet');
  const child0 = root.deriveAccount(0);
  const account0 = new bip84.fromZPrv(child0);
  return account0.getAccountPublicKey();
};
