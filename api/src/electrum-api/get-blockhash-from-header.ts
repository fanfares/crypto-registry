import crypto from 'crypto';

export function getBlockHashFromHeader(header: string): string {
  const buffer = Buffer.from(header, 'hex');
  const firstHash = crypto.createHash('sha256').update(buffer).digest();
  const secondHash = crypto.createHash('sha256').update(firstHash).digest();
  return secondHash.reverse().toString('hex'); // Reverse for big-endian
}

