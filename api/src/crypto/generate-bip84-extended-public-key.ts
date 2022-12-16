import { mnemonicToSeedSync } from 'bip39';
import HDKey from 'hdkey';

export const generateBIP84ExtendedPublicKey = (mnemonic: string): string => {
  const seed = mnemonicToSeedSync(mnemonic);
  const rootKeyPair = HDKey.fromMasterSeed(seed);
  const hardenedChild = rootKeyPair.derive(`m/84'/0'/0'/0/0`);
  return hardenedChild.publicExtendedKey
}
