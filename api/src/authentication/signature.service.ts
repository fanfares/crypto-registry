import { DbService } from '../db/db.service';
import { Message } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { createSign, createVerify } from 'crypto';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { RegistrationMessageDto } from '../types/registration.dto';

@Injectable()
export class SignatureService {

  privateKey: string;
  publicKey: string;

  constructor(
    private dbService: DbService,
    private apiConfigService: ApiConfigService,
    private logger: Logger
  ) {
    this.privateKey = Buffer.from(this.apiConfigService.privateKeyBase64, 'base64').toString('ascii');
    this.publicKey = Buffer.from(this.apiConfigService.publicKeyBase64, 'base64').toString('ascii');
  }

  async verifyRegistration(registrationMessage: Message) {
    this.logger.debug('verify registration', {registrationMessage});
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

  async verify(message: Message) {
    this.logger.debug('verify message', {message});
    if (!message.signature) {
      throw new ForbiddenException('Message has no signature');
    }

    const verify = createVerify('SHA256');
    verify.write(this.messageSignatureInput(message));
    verify.end();
    const senderNode = await this.dbService.nodes.findOne({address: message.senderAddress});
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
}
