const bitcoinjs = require('bitcoinjs-lib') // @3.3.2
const bip39 = require('bip39')
const clone = require('lodash.clonedeep')
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1')

const networks = bitcoinjs.networks
const script = bitcoinjs.script

/*
Bitcoin   0x0488b21e - xpub   0x0488ade4 - xprv   P2PKH or P2SH
Bitcoin   0x049d7cb2 - ypub   0x049d7878 - yprv   P2WPKH in P2SH
Bitcoin   0x0295b43f - Ypub   0x0295b005 - Yprv   P2WSH in P2SH
Bitcoin   0x04b24746 - zpub   0x04b2430c - zprv   P2WPKH
Bitcoin   0x02aa7ed3 - Zpub   0x02aa7a99 - Zprv   P2WSH
*/

// Default is BIP-44
networks.bitcoin.bip32.outputScript = (pubkey) => {
  return script.pubKeyHash.output.encode(
    bitcoinjs.crypto.hash160(pubkey))
}

// BIP-49 is P2PKH-in-P2SH
networks.bip49 = clone(networks.bitcoin)
networks.bip49.bip32 = {
  public: 0x049d7cb2,
  private: 0x049d7878,
  outputScript: (pubkey) => {
    const spendScript = script.witnessPubKeyHash.output.encode(
      bitcoinjs.crypto.hash160(pubkey))
    return script.scriptHash.output.encode(
      bitcoinjs.crypto.hash160(spendScript))
  }
}

// BIP-84 is P2WPKH with bech32-encoded addresses
networks.bip84 = clone(networks.bitcoin)
networks.bip84.bip32 = {
  public: 0x04b24746,
  private: 0x04b2430c,
  outputScript: (pubkey) => {
    return script.witnessPubKeyHash.output.encode(
      bitcoinjs.crypto.hash160(pubkey))
  }
}

// Entropy: 0x00
const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'
const seed = bip39.mnemonicToSeedSync(mnemonic)

function printScheme(purpose, network) {
  const path = `m/${purpose}'/0'/0'`
  const rootNode = BIP32Factory(ecc).fromSeed(seed, network)
  const accountNode = rootNode.derivePath(path)
  const pubkey = accountNode.derive(0).derive(0).publicKeyBuffer()
  const address = bitcoinjs.address.fromOutputScript(
    network.bip32.outputScript(pubkey))
  console.log(`\n${path}`)
  console.log(accountNode.toBase58())
  console.log(accountNode.neutered().toBase58())
  console.log(`${path}/0/0 address:`)
  console.log(address)

}

printScheme(44, networks.bitcoin)
printScheme(49, networks.bip49)
printScheme(84, networks.bip84)
