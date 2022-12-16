import bip84 from 'bip84';

export const generateAddress = (
  zpub: string,
  index: number,
  forChange: boolean
): string => {
  // const childKey = HDKey.fromExtendedKey(extendedPublicKey);
  // const child = childKey.derive(`m/0/${index}`);
  // const { address } = bitcoin.payments.p2wpkh({
  //   pubkey: child.publicKey,
  //   network: bitcoin.networks.testnet
  // });
  // return address;

  const account = new bip84.fromZPub(zpub);
  return account.getAddress(index, forChange);
};
