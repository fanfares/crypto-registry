import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from './email-config.model';
import { HashAlgorithm, Network } from '@bcr/types';

export type LogLevel = 'info' | 'debug'

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {
  }

  get isEmailEnabled() {
    return this.configService.get<string>('EMAIL_ENABLED') === 'true';
  }

  get maxSubmissionAge() {
    const days = this.configService.get<number>('MAX_SUBMISSION_AGE');
    if (!days) {
      throw new Error('Missing MAX_SUBMISSION_AGE from .env');
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
    return this.configService.get<number>('RESERVE_LIMIT');
  }

  get registryZpub(): string {
    return this.configService.get<string>('REGISTRY_ZPUB');
  }

  get network(): Network {
    const config = this.configService.get<string>('NETWORK');
    if (!config || (config !== 'mainnet' && config !== 'testnet')) {
      throw new Error('Invalid Config: NETWORK');
    }
    return config;
  }

  get paymentPercentage(): number {
    return this.configService.get<number>('PAYMENT_PERCENTAGE');
  }

  get dbUrl(): string {
    return this.configService.get<string>('DB_URL');
  }

  get email(): EmailConfig {
    return {
      host: this.configService.get('MAIL_HOST'),
      user: this.configService.get('MAIL_USER'),
      password: this.configService.get('MAIL_PASSWORD'),
      fromEmail: this.configService.get('MAIL_FROM'),
      fromEmailName: this.configService.get('MAIL_FROM_NAME')
    };
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
    if ( !docsUrl ) {
      throw new Error('Invalid Config: missing DOCS_URL')
    }
    return docsUrl;
  }
}
