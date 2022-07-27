import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {

  get tolerance(): number {
    return 100000
  }

  get dbUrl(): string {
    return "mongodb://localhost:27017/bcr";
  }

}
