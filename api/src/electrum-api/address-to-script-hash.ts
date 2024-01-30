import * as bitcoinJs from 'bitcoinjs-lib';


export function addressToScriptHash(address: string): string {
  if (address.startsWith('1') || address.startsWith('m') || address.startsWith('n')) {
    return addressToScriptHashP2PKH(address);
  } else if (address.startsWith('3') || address.startsWith('2')) {
    return addressToScriptHashP2SH(address);
  } else if (address.startsWith('bc1') || address.startsWith('tb1')) {
    return addressToScriptHashBech32(address);
  } else {
    throw new Error('Unknown address type');
  }
}

function addressToScriptHashP2PKH(address: string): string {
  const network = address.startsWith('1') ? bitcoinJs.networks.bitcoin : bitcoinJs.networks.testnet
  const {hash} = bitcoinJs.address.fromBase58Check(address);
  const scriptPubKey = bitcoinJs.payments.p2pkh({hash, network: network}).output;
  const hashBytes = bitcoinJs.crypto.sha256(scriptPubKey);
  const reversedHash = Buffer.from(hashBytes.reverse());
  return reversedHash.toString('hex');
}

function addressToScriptHashP2SH(address: string): string {
  const network = address.startsWith('2') ? bitcoinJs.networks.testnet : bitcoinJs.networks.bitcoin
  const decoded = bitcoinJs.address.fromBase58Check(address);
  const scriptPubKey = bitcoinJs.payments.p2sh({ hash: decoded.hash, network }).output
  const sha256 = bitcoinJs.crypto.sha256(scriptPubKey);
  return sha256.reverse().toString('hex');
}

function addressToScriptHashBech32(address: string): string {
  const network = address.startsWith('tb1') ? bitcoinJs.networks.testnet : bitcoinJs.networks.bitcoin
  const script = bitcoinJs.address.toOutputScript(address, network);
  const hash = bitcoinJs.crypto.sha256(script);
  return hash.reverse().toString('hex');
}






