import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { SubmissionStatus, SubmissionStatusDto, UserIdentity } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { MockAddressDbService } from '../crypto';
import { getHash } from '../utils';
import { SubmissionDbService, SubmissionService } from '../submission';

export interface TestDataOptions {
  createSubmission: boolean;
}

export interface TestIds {
  submissionAddress: string;
  customerEmail: string;
  exchangeName: string;
}

export const createTestData = async (
  exchangeDbService: ExchangeDbService,
  customerHoldingsDbService: CustomerHoldingsDbService,
  submissionDbService: SubmissionDbService,
  apiConfigService: ApiConfigService,
  mockAddressDbService: MockAddressDbService,
  exchangeService: SubmissionService,
  options?: TestDataOptions
): Promise<TestIds> => {
  const identity: UserIdentity = { type: 'reset' };
  await exchangeDbService.deleteMany({}, identity);
  await customerHoldingsDbService.deleteMany({}, identity);
  await submissionDbService.deleteMany({}, identity);
  await mockAddressDbService.deleteMany({}, identity);
  const exchangeAddress1 = 'exchange-address-1';

  for (let index = 1; index < 100; index++) {
    await submissionDbService.insert(
      {
        paymentAddress: `registry-address-${index}`,
        submissionStatus: SubmissionStatus.UNUSED
      },
      identity
    );
  }

  await mockAddressDbService.insert(
    {
      address: exchangeAddress1,
      balance: 1000
    },
    identity
  );

  let submission: SubmissionStatusDto;
  const customerEmail = 'customer-1@mail.com';
  const exchangeName = 'Exchange 1';
  if (options?.createSubmission) {
    submission = await exchangeService.submitHoldings({
      exchangeName: exchangeName,
      customerHoldings: [{
        hashedEmail: getHash(customerEmail, apiConfigService.hashingAlgorithm),
        amount: 1000
      }, {
        hashedEmail: getHash('customer-2@mail.com', apiConfigService.hashingAlgorithm),
        amount: 2000
      }]
    });
  }

  return {
    submissionAddress: submission?.paymentAddress ?? null,
    customerEmail: customerEmail,
    exchangeName: exchangeName
  };
};
