import { DbService } from '../db/db.service';
import { Message } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import fs from 'fs';
import { generateKeyPairSync, createSign, createVerify } from 'crypto';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { RegistrationMessageDto } from '../types/registration.dto';

@Injectable()
export class SignatureService {

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

  // private registrationSignatureInput(registration: RegistrationRequestDto) {
  //   return `${registration.name}:${registration.email}:${registration.nodeName}:${registration.nodeAddress}`;
  // }
  //
  async verifyRegistration(registrationMessage: Message) {
    this.logger.debug('verify registration', registrationMessage);
    const verify = createVerify('SHA256');
    verify.write(this.messageSignatureInput(registrationMessage));
    verify.end();
    const registration: RegistrationMessageDto = JSON.parse(registrationMessage.data);
    const verified = verify.verify(registration.fromPublicKey, registrationMessage.signature, 'hex');
    if (!verified) {
      this.logger.error('Message failed authentication', registration);
      throw new ForbiddenException('Invalid signature');
    }
  }

  //
  // signRegistration(registration: RegistrationRequestDto): RegistrationRequestDto {
  //   this.logger.debug('sign registration', RegistrationRequestDto);
  //   const sign = createSign('SHA256');
  //   sign.update(this.registrationSignatureInput(registration));
  //   sign.end();
  //   const signature = sign.sign(this.privateKey, 'hex');
  //   return {
  //     ...registration,
  //     signature: signature
  //   };
  // }

  async verify(message: Message) {
    this.logger.debug('verify message', message);
    if (!message.signature) {
      throw new ForbiddenException('Message has no signature');
    }

    const verify = createVerify('SHA256');
    verify.write(this.messageSignatureInput(message));
    verify.end();
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

  private messageSignatureInput(message: Message) {
    return message.senderName + ':' + message.senderAddress + ':' + message.data;
  }

  sign(message: Message): Message {
    this.logger.debug('sign message', message);
    const sign = createSign('SHA256');
    sign.update(this.messageSignatureInput(message));
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
