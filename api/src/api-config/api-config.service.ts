import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from './email-config.model';
import { HashAlgorithm, Network } from '@bcr/types';

export type LogLevel = 'info' | 'debug'
export type BitcoinAPI = 'mempool' | 'blockstream' | 'mock'

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {
  }

  get forcedLeader(): string {
    return this.configService.get('FORCED_LEADER')
  }

  get nodeAddress(): string {
    const address = this.configService.get('LOCAL_ADDRESS');
    return address.endsWith('/') ? address.substring(0, address.length - 1) : address;
  }

  get clientAddress(): string {
    const address = this.configService.get('CLIENT_ADDRESS');
    return address.endsWith('/') ? address.substring(0, address.length - 1) : address;
  }

  get nodeName(): string | null {
    return this.configService.get('NODE_NAME');
  }

  get bitcoinApi(): BitcoinAPI {
    const api = this.configService.get<string>('BITCOIN_API');
    if (['mempool', 'blockstream', 'mock'].includes(api)) {
      return api as BitcoinAPI;
    }
    throw new Error('BITCOIN_API environment variable is invalid');
  }

  get isEmailEnabled() {
    return this.configService.get<string>('EMAIL_ENABLED') === 'true';
  }

  get maxSubmissionAge() {
    const days = this.configService.get<number>('MAX_SUBMISSION_AGE');
    if (!days) {
      throw new Error('Missing MAX_SUBMISSION_AGE from environment');
    }
    return days;
  }

  get logLevel(): LogLevel {
    const logLevel = this.configService.get<string>('LOG_LEVEL');
    if (!['info', 'debug'].includes(logLevel)) {
      throw new Error('Invalid log level (use info or debug');
    }
    return logLevel as LogLevel;
  }

  get reserveLimit(): number {
    return 0.9;
  }

  getRegistryZpub(network: Network): string {
    if (network === Network.mainnet) {
      const zpub = this.configService.get<string>('MAINNET_REGISTRY_ZPUB');
      if (!zpub) {
        throw new Error('Invalid config - MAINNET_REGISTRY_ZPUB not set');
      }
      return zpub;
    } else if (network === Network.testnet) {
      const zpub = this.configService.get<string>('TESTNET_REGISTRY_ZPUB');
      if (!zpub) {
        throw new Error('Invalid config - TESTNET_REGISTRY_ZPUB not set');
      }
      return zpub;
    } else {
      throw new Error('Invalid network');
    }
  }

  get paymentPercentage(): number {
    return 0.0001;
  }

  get dbUrl(): string {
    return this.configService.get<string>('DB_URL');
  }

  get email(): EmailConfig {
    return {
      host: this.configService.get('MAIL_HOST'),
      user: this.configService.get('MAIL_USER'),
      password: this.configService.get('MAIL_PASSWORD'),
      fromEmail: this.configService.get('OWNER_EMAIL'),
      fromEmailName: this.configService.get('INSTITUTION_NAME')
    };
  }

  get ownerEmail(): string {
    const ownerEmail = this.configService.get('OWNER_EMAIL');
    if (!ownerEmail) {
      throw new Error('Invalid Config: missing OWNER_EMAIL');
    }
    return ownerEmail;
  }

  get institutionName(): string {
    const institutionName = this.configService.get('INSTITUTION_NAME');
    if (!institutionName) {
      throw new Error('Invalid Config: missing INSTITUTION_NAME');
    }
    return institutionName;
  }

  get isTestMode(): boolean {
    return this.configService.get('TEST_MODE') === 'true';
  }

  get port(): number {
    return this.configService.get<number>('PORT');
  }

  get hashingAlgorithm(): HashAlgorithm {
    return this.configService.get<HashAlgorithm>('HASH_ALGORITHM');
  }

  get docsUrl(): string {
    const docsUrl = this.configService.get('DOCS_URL');
    if (!docsUrl) {
      throw new Error('Invalid Config: missing DOCS_URL');
    }
    return docsUrl;
  }

  get jwtSigningSecret(): string {
    const secret = this.configService.get('JWT_SIGNING_SECRET');
    if (!secret) {
      throw new Error('Invalid Config: missing JWT_SIGNING_SECRET');
    }
    return secret;
  }

  get privateKeyBase64(): string {
    const privateKey = this.configService.get('PRIVATE_KEY_BASE64');
    if (!privateKey) {
      throw new Error('Invalid Config: missing PRIVATE_KEY_BASE64');
    }
    return privateKey;
  }

  get publicKeyBase64(): string {
    const privateKey = this.configService.get('PUBLIC_KEY_BASE64');
    if (!privateKey) {
      throw new Error('Invalid Config: missing PUBLIC_KEY_BASE64');
    }
    return privateKey;
  }

  get syncMessageSending(): boolean {
    return this.configService.get('SYNC_MESSAGE_SENDING') || false
  }
}
