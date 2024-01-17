/*
  https://electrum.readthedocs.io/en/latest/xpub_version_bytes.html
  https://github.com/satoshilabs/slips/blob/master/slip-0132.md
 */

import { Network } from '@bcr/types';

export type AddressEncoding = 'p2wpkh';

export interface VersionData {
  private: boolean;
  version: number
  network: Network;
  path: string;
  addressEncoding: AddressEncoding
}

const testnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef
};

const mainnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80
};

export interface BIP32NetworkDescription {
  messagePrefix: string;
  bech32: string;
  bip32: {
    public: number;
    private: number;
  },
  pubKeyHash: number,
  scriptHash: number,
  wif: number,
}

export type PublicKeyNetworkPrefix = 'zpub' | 'vpub';
export type PrivateKeyNetworkPrefix = 'zprv' | 'vprv';
export type NetworkPrefix = PublicKeyNetworkPrefix | PrivateKeyNetworkPrefix


const versions: Record<NetworkPrefix, VersionData> = {
  'zpub': {
    private: false,
    version: 0x04b24746,
    network: Network.mainnet,
    path: 'm/84\'/0\'/0\'',
    addressEncoding: 'p2wpkh'
  },
  'zprv': {
    private: true,
    version: 0x04b2430c,
    network: Network.mainnet,
    path: 'm/84\'/0\'/0\'',
    addressEncoding: 'p2wpkh'
  },
  'vpub': {
    private: false,
    version: 0x045f1cf6,
    network: Network.testnet,
    path: 'm/84\'/1\'/0\'',
    addressEncoding: 'p2wpkh'
  },
  'vprv': {
    private: true,
    version: 0x045f18bc,
    network: Network.testnet,
    path: 'm/84\'/1\'/0\'',
    addressEncoding: 'p2wpkh'
  }
};

export function  getPathForPrefix(prefix: NetworkPrefix): string {
  const version = versions[prefix];
  return version?.path ?? undefined
}

export function getNetworkFromKey(key: string): Network {
  const prefix = key.substring(0, 4);
  const version = versions[prefix];
  return version?.network ?? undefined;
}

export function getNetworkFromPrefix(
  prefix: NetworkPrefix
): Network {
  const version = versions[prefix];
  return version?.network ?? undefined;
}

export function getBip32NetworkForKey(key: string): BIP32NetworkDescription {
  const prefix = key.substring(0, 4) as NetworkPrefix;
  return getBip32NetworkForPrefix(prefix);
}

export const getBip32NetworkForPrefix = (
  prefix: NetworkPrefix
): BIP32NetworkDescription | null => {
  const version = versions[prefix];
  if (!version) {
    throw new Error('Unknown key version');
  }

  const bip32 = version.private ? {
    private: version.version,
    public: 0
  } : {
    private: 0,
    public: version.version
  }

  return {
    ...version.network === Network.mainnet ? mainnet : testnet,
    bip32: bip32
  };
};

