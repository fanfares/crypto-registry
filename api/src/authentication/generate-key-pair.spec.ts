import { generateKeypair } from './generate-keypair';
import fs from 'fs';
import { createSign, createVerify } from 'crypto';


describe('keypair', () => {
  test('generate, sign and verify', () => {
    generateKeypair('node-1');

    const privateKey = fs.readFileSync('node-1_rsa.prv').toString();
    const publicKey = fs.readFileSync('node-1_rsa.pub').toString();

    const sign = createSign('SHA256');
    const messageToSign = 'hello world';
    sign.update(messageToSign);
    sign.end();
    const signature = sign.sign(privateKey, 'hex');

    const verify = createVerify('SHA256');
    verify.write(messageToSign);
    verify.end();
    expect(verify.verify(publicKey, signature, 'hex')).toBe(true);
  });
});
