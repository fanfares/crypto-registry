import * as forge from 'node-forge';

export function isValidRSAPublicKey(key: string): boolean {
  try {
    const publicKey = forge.pki.publicKeyFromPem(key) as forge.pki.rsa.PublicKey;

    // Optional: Check key length, e.g., 2048 bits
    if (publicKey.n.bitLength() === 2048) { // eslint-disable-line
      return true;
    }

    return false;
  } catch (error) {
    // Handle parsing error (invalid format, etc.)
    return false;
  }
}
