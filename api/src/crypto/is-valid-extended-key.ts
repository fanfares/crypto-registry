import { Bip84Utils } from './bip84-utils';
import { ExtendedKeyValidationResult } from '@bcr/types';

export const isValidExtendedKey = (zpub: string): ExtendedKeyValidationResult => {
  try {
    const utils = Bip84Utils.fromExtendedKey(zpub);
    return {
      valid: true,
      network: utils.network,
      isPrivate: utils.isPrivateKey
    };
  } catch (err) {
    return {
      valid: false
    };
  }
};
