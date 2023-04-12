import {TestingModule} from '@nestjs/testing';
import {TestUtilsService} from './test-utils.service';
import {ResetDataOptions} from '@bcr/types';

export const resetModule = async (
  module: TestingModule,
  options?: ResetDataOptions
): Promise<void> => {
  const testUtilsService = module.get<TestUtilsService>(TestUtilsService);
  return await testUtilsService.resetDb(options);
};
