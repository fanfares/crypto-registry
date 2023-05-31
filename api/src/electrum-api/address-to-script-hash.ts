import * as bitcoinjs from "bitcoinjs-lib";
import * as crypto from 'crypto';
import * as bitcoin from "bitcoinjs-lib";
import { testnet } from "bitcoinjs-lib/src/networks";

function getAddressType(address: string): 'P2PKH' | 'P2SH' | 'Bech32' {
  if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
    return 'P2PKH';
  } else if (address.startsWith('3') || address.startsWith('2')) {
    return 'P2SH';
  } else if (address.startsWith('bc1') || address.startsWith('tb1')) {
    return 'Bech32';
  } else {
    throw new Error('Unknown address type');
  }
}

export function addressToScriptHash(address): string {
  const type = getAddressType(address);
  switch (type) {
    case "Bech32":
      return addressToScriptHashBech32(address);
    case "P2PKH":
      return addressToScriptHashP2pKh(address)
    default:
      throw new Error('Not implemented')
  }
}

function addressToScriptHashP2pKh(address: string): string {
  const {hash} = bitcoinjs.address.fromBase58Check(address);
  const scriptPubKey = bitcoinjs.payments.p2pkh({hash}).output as Buffer;
  const hashBytes = bitcoinjs.crypto.sha256(scriptPubKey);
  const reversedHash = Buffer.from(hashBytes.reverse());
  return reversedHash.toString('hex');
}

function addressToScriptHashBech32(address: string): string {
  const script = bitcoin.address.toOutputScript(address, testnet)
  const hash = bitcoin.crypto.sha256(script)
  return hash.reverse().toString('hex')
}






