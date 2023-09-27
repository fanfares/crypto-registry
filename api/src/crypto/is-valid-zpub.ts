import { Bip84Utils } from './bip84-utils';
import { ZpubValidationResult } from '@bcr/types';

export const isValidZpub = (zpub: string): ZpubValidationResult => {
  try {
    const utils = new Bip84Utils(zpub);
    return {
      valid: true,
      network: utils.network
    };
  } catch (err) {
    return {
      valid: false
    };
  }
};
