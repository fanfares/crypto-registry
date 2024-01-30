/*
 For context see;
  https://electrum.readthedocs.io/en/latest/xpub_version_bytes.html
  https://github.com/satoshilabs/slips/blob/master/slip-0132.md
 */

import { Network } from '@bcr/types';

export type ScriptType = 'p2wpkh' | 'p2pkh' | 'p2wpkh-p2sh';

export interface NetworkDefinition {
  private: boolean;
  version: number
  network: Network;
  path: string;
  scriptType: ScriptType;
  name: string;
}

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

const testnet: BIP32NetworkDescription = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
  bip32: {
    private: undefined,
    public: undefined
  }
};

const mainnet: BIP32NetworkDescription = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
  bip32: {
    private: undefined,
    public: undefined
  }
};

export type PublicKeyNetworkPrefix = 'zpub' | 'vpub' | 'xpub' | 'tpub' | 'ypub' | 'upub';
export type PrivateKeyNetworkPrefix = 'zprv' | 'vprv' | 'xprv' | 'tprv' | 'yprv' | 'uprv';
export type NetworkPrefix = PublicKeyNetworkPrefix | PrivateKeyNetworkPrefix


const networkDefinitions: Record<NetworkPrefix, NetworkDefinition> = {
  'zpub': {
    private: false,
    version: 0x04b24746,
    network: Network.mainnet,
    path: 'm/84\'/0\'/0\'',
    scriptType: 'p2wpkh',
    name: 'Native Segwit'
  },
  'zprv': {
    private: true,
    version: 0x04b2430c,
    network: Network.mainnet,
    path: 'm/84\'/0\'/0\'',
    scriptType: 'p2wpkh',
    name: 'Native Segwit'
  },
  'vpub': {
    private: false,
    version: 0x045f1cf6,
    network: Network.testnet,
    path: 'm/84\'/1\'/0\'',
    scriptType: 'p2wpkh',
    name: 'Native Segwit'
  },
  'vprv': {
    private: true,
    version: 0x045f18bc,
    network: Network.testnet,
    path: 'm/84\'/1\'/0\'',
    scriptType: 'p2wpkh',
    name: 'Native Segwit'
  },
  'tpub': {
    private: false,
    version: 0x043587cf,
    network: Network.testnet,
    path: 'm/44\'/1\'/0\'',
    scriptType: 'p2pkh',
    name: 'Legacy'
  },
  'tprv': {
    private: true,
    version: 0x04358394,
    network: Network.testnet,
    path: 'm/44\'/1\'/0\'',
    scriptType: 'p2pkh',
    name: 'Legacy'
  },
  'xpub': {
    private: false,
    version: 0x0488b21e,
    network: Network.mainnet,
    path: 'm/44\'/1\'/0\'',
    scriptType: 'p2wpkh',
    name: 'Legacy'
  },
  'xprv': {
    private: true,
    version: 0x0488ade4,
    network: Network.mainnet,
    path: 'm/44\'/1\'/0\'',
    scriptType: 'p2pkh',
    name: 'Legacy'
  },
  'upub': {
    private: false,
    version: 0x044a5262,
    network: Network.testnet,
    path: 'm/49\'/1\'/0\'',
    scriptType: 'p2wpkh-p2sh',
    name: 'P2SH-Segwit'
  },
  'uprv': {
    private: true,
    version: 0x044a4e28,
    network: Network.testnet,
    path: 'm/49\'/1\'/0\'',
    scriptType: 'p2wpkh-p2sh',
    name: 'P2SH-Segwit'
  },
  'ypub': {
    private: false,
    version: 0x049d7cb2,
    network: Network.mainnet,
    path: 'm/49\'/1\'/0\'',
    scriptType: 'p2wpkh-p2sh',
    name: 'P2SH-Segwit'
  },
  'yprv': {
    private: true,
    version: 0x049d7878,
    network: Network.mainnet,
    path: 'm/49\'/1\'/0\'',
    scriptType: 'p2wpkh-p2sh',
    name: 'P2SH-Segwit'
  }
};

export function getNetworkDefinitionFromPrefix(
  prefix: NetworkPrefix
): NetworkDefinition {
  return networkDefinitions[prefix];
}

export function getNetworkDefinitionFromKey(
  key: string
): NetworkDefinition {
  const prefix = key.substring(0, 4);
  return networkDefinitions[prefix];
}

export function  getPathForPrefix(prefix: NetworkPrefix): string {
  const version = networkDefinitions[prefix];
  return version?.path ?? undefined
}

export function  getPathForKey(key: string): string {
  const prefix = key.substring(0, 4);
  const version = networkDefinitions[prefix];
  return version?.path ?? undefined
}

export function getNetworkFromKey(key: string): Network {
  const prefix = key.substring(0, 4);
  const version = networkDefinitions[prefix];
  return version?.network ?? undefined;
}

export function getNetworkFromPrefix(
  prefix: NetworkPrefix
): Network {
  const version = networkDefinitions[prefix];
  return version?.network ?? undefined;
}

export function getBip32NetworkForKey(key: string): BIP32NetworkDescription {
  const prefix = key.substring(0, 4) as NetworkPrefix;
  return getBip32NetworkForPrefix(prefix);
}

export const getBip32NetworkForPrefix = (
  prefix: NetworkPrefix
): BIP32NetworkDescription | null => {
  const version = networkDefinitions[prefix];
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

