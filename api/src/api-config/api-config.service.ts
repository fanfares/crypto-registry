import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from './email-config.model';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get registrationCost(): number {
    return 10000;
  }

  get submissionErrorTolerance(): number {
    return this.configService.get<number>('SUBMISSION_ERROR_TOLERANCE');
  }

  get dbUrl(): string {
    return this.configService.get<string>('DB_URL');
  }

  get dbEnabled(): boolean {
    return this.configService.get<string>('DB_ENABLED') === 'true';
  }

  get registryKey(): string {
    return this.configService.get('REGISTRY_PUBLIC_KEY');
  }

  get email(): EmailConfig {
    return {
      host: this.configService.get('MAIL_HOST'),
      user: this.configService.get('MAIL_USER'),
      password: this.configService.get('MAIL_PASSWORD'),
      fromEmail: this.configService.get('MAIL_FROM'),
      fromEmailName: this.configService.get('MAIL_FROM_NAME'),
    };
  }

  get isTestMode(): boolean {
    return this.configService.get('TEST_MODE');
  }

  get port(): number {
    return this.configService.get<number>('PORT')
  }
}