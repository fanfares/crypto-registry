import { Test, TestingModule } from '@nestjs/testing';
import { ApiConfigService } from './api-config.service';

describe('ConfigService', () => {
  let service: ApiConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiConfigService],
    }).compile();

    service = module.get<ApiConfigService>(ApiConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
