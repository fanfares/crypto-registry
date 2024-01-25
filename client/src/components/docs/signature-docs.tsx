import CodeRenderComponent from './code-box.tsx';

const signature = `
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';
import BIP32Factory from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bitcoinMessage from 'bitcoinjs-message';

const network = {
  messagePrefix: '\x18Bitcoin Signed Message:\\n',
  bech32: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
  bip32: {
    private: 0x045f18bc,
    public: 0x045f1cf6
  }
};

const seedPhrase = 'your seed phrase';
const seed = bip39.mnemonicToSeedSync(seedPhrase);
const root = BIP32Factory(ecc).fromSeed(seed, network);
const path = 'm/84\\'/1\\'/0\\'/0/0';
const child = root.derivePath(path);

const {address} = bitcoin.payments.p2wpkh({pubkey: child.publicKey, network});

const message = 'I assert that, as of 25 Jan 2024, the exchange owns the referenced bitcoin on behalf of the customers specified';
const signature = bitcoinMessage.sign(message, child.privateKey, true);

console.log('Address:', address);
console.log('Signature:', signature.toString('base64'));
`;

const SignatureDocs = () => {
  return (
    <>
      <h3>Signing Funding Addresses</h3>
      <p>Below is example typescript code to generate a valid signature within testnet.  You will have to adjust the network and derivation paths for your network.</p>
      <p>A more fleshed out example is provided in the <a href="https://github.com/robport/cdr-examples">examples</a></p>
      <CodeRenderComponent codeString={signature}/>
    </>);
};

export default SignatureDocs;
