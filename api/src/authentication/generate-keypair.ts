import { generateKeyPairSync } from 'crypto';
import fs from 'fs';

export const generateKeypair = (nodeName: string) => {
  const privateKeyFile = `${nodeName}_rsa.prv`;
  const publicKeyFile = `${nodeName}_rsa.pub`;

  if (fs.existsSync(privateKeyFile)) {
    return;
  }

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

  fs.writeFileSync(privateKeyFile, keypair.privateKey);
  fs.writeFileSync(publicKeyFile, keypair.publicKey);

  return keypair;
};
