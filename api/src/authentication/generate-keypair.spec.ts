import { generateKeyPairSync } from 'crypto';
import { generateMnemonic } from 'bip39';
import { Bip84Account } from '../crypto/bip84-account';
import { Network } from '@bcr/types';

describe('generate environment files', () => {
  test('generate .env ', () => {
    const keypair = generateKeyPairSync(
      'rsa',
      {
        modulusLength: 2048, // It holds a number. It is the key size in bits and is applicable for RSA, and DSA algorithm only.
        publicKeyEncoding: {
          type: 'pkcs1', //Note the type is pkcs1 not spki
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs1', //Note again the type is set to pkcs1
          format: 'pem'
          //cipher: "aes-256-cbc", //Optional
          //passphrase: "", //Optional
        }
      });

    const mnemonic = generateMnemonic();
    const testnetZpub = Bip84Account.zpubFromMnemonic(mnemonic)
    const mainnetZpub = Bip84Account.zpubFromMnemonic(mnemonic, Network.mainnet)

    interface Var {
      name: string;
      value: string
    }

    const vars: Var[] = [];
    vars.push({
      name: 'TESTNET_REGISTRY_ZPUB',
      value: testnetZpub
    })

    vars.push({
      name: 'MAINNET_REGISTRY_ZPUB',
      value: mainnetZpub
    })

    const prvEncoded = Buffer.from(keypair.privateKey).toString('base64');
    vars.push({
      name: 'PUBLIC_KEY_BASE64',
      value: prvEncoded
    })

    const pubEncoded = Buffer.from(keypair.publicKey).toString('base64');
    vars.push({
      name: 'PRIVATE_KEY_BASE64',
      value: pubEncoded
    })

    const env = vars.reduce((e, v) => {
      return `${e}${v.name}=${v.value}\n`
    }, '')

    console.log(env)

  });
});
