import HDKey from 'hdkey';
import * as bitcoin from 'bitcoinjs-lib';

export const generateAddress = (
  extendedPublicKey: string,
  index: number
): string => {
  const childKey = HDKey.fromExtendedKey(extendedPublicKey);
  const child = childKey.derive(`m/0/${index}`);
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: bitcoin.networks.testnet
  });
  return address;
};
