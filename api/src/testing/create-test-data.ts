import { ExchangeDbService } from '../exchange';
import { CustomerHoldingsDbService } from '../customer/customer-holdings-db.service';
import { SubmissionStatus, SubmissionStatusDto, UserIdentity } from '@bcr/types';
import { ApiConfigService } from '../api-config';
import { MockAddressDbService, MockBitcoinService } from '../crypto';
import { getHash } from '../utils';
import { SubmissionDbService, SubmissionService } from '../submission';
import { generateAddress } from '../crypto/generate-address';

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
  mockBitcoinDbService: MockAddressDbService,
  exchangeService: SubmissionService,
  options?: TestDataOptions
): Promise<TestIds> => {
  const identity: UserIdentity = { type: 'reset' };
  await exchangeDbService.deleteMany({}, identity);
  await customerHoldingsDbService.deleteMany({}, identity);
  await submissionDbService.deleteMany({}, identity);
  await mockBitcoinDbService.deleteMany({}, identity);

  const extendedPublicKey = apiConfigService.extendedPublicKey;

  for (let index = 1; index < 100; index++) {
    await submissionDbService.insert({
      paymentAddress: generateAddress(extendedPublicKey, index),
      status: SubmissionStatus.UNUSED
    }, identity);
  }

  await mockBitcoinDbService.insert({
    address: 'faucet',
    balance: 10000000,
    sendingAddressBalance: NaN
  }, identity);

  const exchangeAddress1 = 'exchange-address-1';
  const bitcoinService = new MockBitcoinService(mockBitcoinDbService);
  await bitcoinService.sendFunds('faucet', exchangeAddress1, 3000);

  let submission: SubmissionStatusDto;
  const customerEmail = 'customer-1@mail.com';
  const exchangeName = 'Exchange 1';
  if (options?.createSubmission) {
    submission = await exchangeService.createSubmission({
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
