import crypto from 'crypto';

export function getBlockHashFromHeader(header: string): string {
  let buffer = Buffer.from(header, 'hex');
  let firstHash = crypto.createHash('sha256').update(buffer).digest();
  let secondHash = crypto.createHash('sha256').update(firstHash).digest();
  return secondHash.reverse().toString('hex'); // Reverse for big-endian
}

