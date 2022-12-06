import * as crypto from 'crypto';
import { HashAlgorithm } from '@bcr/types';

export const getHash = (value: string, algorithm: HashAlgorithm): string => {
  switch (algorithm) {
    case 'simple':
      return 'hash-' + value;
    default:
      return crypto.createHash(algorithm).update(value).digest('hex');
  }
};
