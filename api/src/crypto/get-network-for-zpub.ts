import { Network } from '@bcr/types';
import { Bip84Utils } from './bip84-utils';

export const getNetworkForZpub = (zpub: string): Network => {
  return Bip84Utils.getNetworkForExtendedKey(zpub);
};
