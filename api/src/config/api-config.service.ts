import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {

  constructor(private configService: ConfigService) {
  }

  get redTolerance(): number {
    return 100000
  }

  get amberTolerance(): number {
    return 50000;
  }

  get dbUrl(): string {
    return this.configService.get('MONGO_URL');
  }

  get registryPublicKey(): string {
    return this.configService.get('BCR_PUBLIC_KEY');
  }

}
