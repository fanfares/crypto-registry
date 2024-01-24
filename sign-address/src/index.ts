import * as  bitcoin from 'bitcoinjs-lib';
import {BIP32Factory} from 'bip32'
import * as ecc  from 'tiny-secp256k1';
import * as bitcoinMessage from 'bitcoinjs-message';

const bip32Network = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'tb',
  bip32: {
    private: 0x045f18bc,
    public: 0x045f1cf6
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef
};

function signAddress(extendedPrivateKey: string, message: string, change: boolean, index: number ) {
  const root = BIP32Factory(ecc).fromBase58(extendedPrivateKey, bip32Network);
  const child = root.derive(change ? 1 : 0).derive(index);
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: bip32Network
  });
  const signature = bitcoinMessage.sign(message, child.privateKey, true);
  return {
    signature: signature.toString('base64'),
    address: address
  }
}

// Extended Private Key of Wallet Owning Address
const vprv = 'vprv9Lrz51GgUJnZAcPJpGpNCfrHFYrqHcvPHG6b9jAHM9WudF3CgKdLJhMoupiMzRcXkTxN33FwKCt8YQHP3aitmx3FaGbSXmCQ91qJz2NTqPE'
const xprv = 'xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi'

// An address containing customer funds.
const expectedAddress = 'tb1q7yx7zmzu9c5s0d6s4ccsagt8r53u8kyrjsgncv'
const expectedSignature = 'Hz8ayR3sB0HQzBYjJLCSOdZzmLO/rmiPXVhCjDekyhgDZJZtER/3paT4F/UZFuPxopkrgk2wdobXraEcqLLPZng=';
const message = 'hello world';

const {signature, address} = signAddress(vprv, message, false, 1)

console.log('Sig Correct?: ', signature === expectedSignature);
console.log('Addr Correct?: ', address === expectedAddress);
