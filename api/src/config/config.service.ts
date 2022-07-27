import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {

  get redTolerance(): number {
    return 100000
  }

  get amberTolerance(): number {
    return 50000;
  }

  get dbUrl(): string {
    return "mongodb://localhost:27017/bcr";
  }

  get registryPublicKey(): string {
    return "3QUkWUSf3jPJesapKiJByQ7f4C6uuyPEJ8"
  }

}
