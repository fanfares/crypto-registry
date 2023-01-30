import { DbService } from '../db/db.service';
import { Message } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import fs from 'fs';
import { generateKeyPairSync, createSign, createVerify } from 'crypto';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MessageAuthService {

  nodeName: string;
  privateKey: string;
  publicKey: string;

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private logger: Logger
  ) {
    this.init();
  }

  async verify(message: Message) {
    this.logger.debug('verify message', message);
    if (!message.signature) {
      throw new ForbiddenException('Message has no signature');
    }

    const verify = createVerify('SHA256');
    verify.write(this.signatureInput(message));
    verify.end();
    console.log(await this.dbService.nodes.find({}));
    console.log(message);
    const senderNode = await this.dbService.nodes.findOne({ address: message.senderAddress });
    if (!senderNode) {
      throw new ForbiddenException('Unknown sender');
    }
    const verified = verify.verify(senderNode.publicKey, message.signature, 'hex');
    if (!verified) {
      this.logger.error('Message failed authentication', message);
      throw new ForbiddenException('Invalid signature');
    }
  }

  private signatureInput(message: Message) {
    return message.senderName + ':' + message.senderAddress + ':' + message.data;
  }

  sign(message: Message): Message {
    this.logger.debug('sign message', message);
    const sign = createSign('SHA256');
    sign.update(this.signatureInput(message));
    sign.end();
    const signature = sign.sign(this.privateKey, 'hex');
    return {
      ...message,
      signature: signature
    };
  }

  private init() {
    this.nodeName = this.apiConfigService.nodeName;
    const privateKeyFile = `${this.nodeName}_rsa.prv`;
    const publicKeyFile = `${this.nodeName}_rsa.pub`;

    if (fs.existsSync(privateKeyFile)) {
      this.privateKey = fs.readFileSync(privateKeyFile).toString();
      this.publicKey = fs.readFileSync(publicKeyFile).toString();
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

    this.privateKey = keypair.privateKey;
    this.publicKey = keypair.publicKey;

    fs.writeFileSync(privateKeyFile, keypair.privateKey);
    fs.writeFileSync(publicKeyFile, keypair.publicKey);

    return keypair;
  }
}
