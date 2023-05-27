import * as bitcoinjs from "bitcoinjs-lib";
import * as crypto from 'crypto';

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
  const { data, version } = bitcoinjs.address.fromBech32(address);

  // Prepare scriptPubKey - version + pushdata opcode + data
  const scriptPubKey = Buffer.concat([
    Buffer.from([version ? 0x80 + version : 0x00]),
    Buffer.from([data.length]),
    data
  ]);

  // Double SHA256 hash
  const hash = crypto.createHash('sha256').update(scriptPubKey);
  const hash2 = crypto.createHash('sha256').update(hash.digest());

  // Reverse the bytes as per Bitcoin's "little endian" format
  return Buffer.from(hash2.digest().reverse()).toString('hex');
}






