import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailConfig } from './email-config.model';

@Injectable()
export class ApiConfigService {

  constructor(private configService: ConfigService) {
  }

  get maxBalanceTolerance(): number {
    return 1000000;
  }

  get dbUrl(): string {
    return this.configService.get('MONGO_URL');
  }

  get registryPublicKey(): string {
    return this.configService.get('BCR_PUBLIC_KEY');
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
}
