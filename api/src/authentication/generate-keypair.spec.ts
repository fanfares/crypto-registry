import { generateKeyPairSync } from 'crypto';

describe('generate keypair', () => {
  test('generate .env entries', () => {
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

    const prvEncoded = Buffer.from(keypair.privateKey).toString('base64');
    const pubEncoded = Buffer.from(keypair.publicKey).toString('base64');
    console.log(`PUBLIC_KEY_BASE64=${pubEncoded}\nPRIVATE_KEY_BASE64=${prvEncoded}`);
  });
});
