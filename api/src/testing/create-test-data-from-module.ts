import { TestDataOptions, TestIds } from './create-test-data';
import { TestingModule } from '@nestjs/testing';
import { TestUtilsService } from './test-utils.service';

export const createTestDataFromModule = async (
  module: TestingModule,
  options?: TestDataOptions
): Promise<TestIds> => {
  const testUtilsService = module.get<TestUtilsService>(TestUtilsService);
  return await testUtilsService.resetTestData(
    options
  );
};
